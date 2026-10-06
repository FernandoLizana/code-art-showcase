#!/usr/bin/env python3
"""
E2E Selenium — recorre ARCANA OBSCURA Flask hasta el final.

Requisitos:
  pip install selenium webdriver-manager
  Node/npm en la raíz del repo (puente TS)
  Flask corriendo (E2E_BASE_URL)

Uso:
  cd flask
  python scripts/selenium_full_run.py

Variables:
  E2E_BASE_URL=http://127.0.0.1:8080
  E2E_HEADLESS=1          (0 = ver navegador)
  E2E_RESET_DB=1          (borra sesiones/IPs locales antes de empezar)
"""
from __future__ import annotations

import json
import os
import sys
import time
import uuid
from pathlib import Path

import requests

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from webdriver_manager.chrome import ChromeDriverManager

FLASK_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(FLASK_DIR))

from game import bridge, context, db  # noqa: E402

BASE_URL = os.environ.get("E2E_BASE_URL", "http://127.0.0.1:8080").rstrip("/")
HEADLESS = os.environ.get("E2E_HEADLESS", "1").lower() not in ("0", "false", "no")
MAX_LEVELS = int(os.environ.get("E2E_MAX_LEVELS", "100"))
RESET_DB = os.environ.get("E2E_RESET_DB", "0").lower() in ("1", "true", "yes")


def log(msg: str) -> None:
    print(msg, flush=True)


def make_driver() -> webdriver.Chrome:
    options = webdriver.ChromeOptions()
    if HEADLESS:
        options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1280,900")
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    driver.set_page_load_timeout(90)
    return driver


def reset_test_data() -> None:
    db.init_db()
    with db.get_conn() as conn:
        if RESET_DB:
            conn.execute("DELETE FROM level_progress")
            conn.execute("DELETE FROM notebook")
            conn.execute("DELETE FROM participated_ips")
            conn.execute("DELETE FROM participated_fingerprints")
            conn.execute("DELETE FROM sessions")
        else:
            conn.execute("DELETE FROM participated_ips WHERE ip IN ('127.0.0.1', '::1')")


def latest_session_id() -> str:
    with db.get_conn() as conn:
        row = conn.execute(
            "SELECT id FROM sessions ORDER BY created_at DESC LIMIT 1",
        ).fetchone()
    if not row:
        raise RuntimeError("No hay sesión en la base de datos")
    return row["id"]


def player_context(session_id: str) -> dict:
    ctx = context.build_context(session_id)
    if not ctx or not ctx.get("personality"):
        raise RuntimeError("Sesión sin personalidad")
    return ctx


def submit_payload(driver: webdriver.Chrome, level_id: int, payload: dict) -> None:
    cookies = {c["name"]: c["value"] for c in driver.get_cookies()}
    resp = requests.post(
        f"{BASE_URL}/nivel/{level_id}",
        data={"payload": json.dumps(payload)},
        cookies=cookies,
        timeout=90,
    )
    resp.raise_for_status()
    driver.get(resp.url)


def parse_level_url(url: str) -> int | None:
    if "/nivel/" not in url:
        return None
    part = url.split("/nivel/", 1)[1]
    num = part.split("?", 1)[0].split("#", 1)[0].strip("/")
    return int(num) if num.isdigit() else None


def click_first_btn_link(driver: webdriver.Chrome, wait: WebDriverWait) -> bool:
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "a.btn")))
    for link in driver.find_elements(By.CSS_SELECTOR, "a.btn"):
        href = link.get_attribute("href") or ""
        if "/nivel/" in href or "/final" in href or href.endswith("/umbral"):
            link.click()
            return True
    return False


def answer_personality(driver: webdriver.Chrome, wait: WebDriverWait) -> None:
    for i in range(10):
        wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "button.option")))
        driver.find_element(By.CSS_SELECTOR, "button.option").click()
        time.sleep(0.2)
        log(f"  prueba {i + 1}/10")


def wait_level_done(session_id: str, level_id: int, timeout: float = 45.0) -> None:
    deadline = time.time() + timeout
    while time.time() < deadline:
        ctx = player_context(session_id)
        if level_id in (ctx.get("completedLevels") or []):
            return
        time.sleep(0.5)
    raise RuntimeError(f"Timeout: nivel {level_id} no completado")


def solve_and_submit(driver: webdriver.Chrome, session_id: str, level_id: int) -> None:
    ctx = player_context(session_id)
    solved = bridge.solve_level(level_id, ctx)
    payload = solved["payload"]
    submit_payload(driver, level_id, payload)
    wait_level_done(session_id, level_id)


def run() -> None:
    log(f"E2E -> {BASE_URL} (headless={HEADLESS}, max={MAX_LEVELS})")
    reset_test_data()

    driver = make_driver()
    wait = WebDriverWait(driver, 30)
    fp = f"e2e_{uuid.uuid4().hex[:16]}"

    try:
        driver.get(BASE_URL)
        driver.execute_script("localStorage.setItem('arcana_fp', arguments[0]);", fp)

        wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, 'a[href="/advertencia"]'))).click()
        wait.until(EC.url_contains("/advertencia"))
        wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, 'form button[type="submit"]'))).click()

        wait.until(EC.url_contains("/prueba"))
        log("Prueba de personalidad...")
        answer_personality(driver, wait)

        wait.until(EC.url_contains("/resultado"))
        wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, 'a[href="/umbral"]'))).click()

        wait.until(EC.url_contains("/umbral"))
        wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "button.door"))).click()

        session_id = latest_session_id()
        log(f"Sesion: {session_id[:8]}...")

        completed = 0
        while completed < MAX_LEVELS:
            wait.until(lambda d: "/nivel/" in d.current_url or "/final" in d.current_url or "/umbral" in d.current_url)

            if "/final" in driver.current_url:
                log("Pantalla final detectada.")
                break

            if "/umbral" in driver.current_url:
                click_first_btn_link(driver, wait)
                continue

            level_id = parse_level_url(driver.current_url)
            if not level_id:
                raise RuntimeError(f"URL inesperada: {driver.current_url}")

            log(f"Resolviendo umbral {completed + 1}/{MAX_LEVELS} (nivel #{level_id})...")
            solve_and_submit(driver, session_id, level_id)

            ctx = player_context(session_id)
            completed = len(ctx.get("completedLevels") or [])
            log(f"  OK completados: {completed}")

            if completed >= MAX_LEVELS:
                if MAX_LEVELS >= 100:
                    driver.get(f"{BASE_URL}/final")
                else:
                    log(f"E2E parcial OK ({completed} umbrales).")
                    return
                break

            if not click_first_btn_link(driver, wait):
                driver.get(f"{BASE_URL}/umbral")
                click_first_btn_link(driver, wait)

        if MAX_LEVELS >= 100:
            wait.until(lambda d: "/final" in d.current_url)
            body = driver.find_element(By.TAG_NAME, "body").text
            if "Fin" not in body:
                raise RuntimeError("Final no muestra texto esperado")
            log("E2E OK - llego al final.")
    finally:
        driver.quit()


if __name__ == "__main__":
    try:
        run()
    except Exception as exc:
        log(f"E2E FALLO: {exc}")
        sys.exit(1)
