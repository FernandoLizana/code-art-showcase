"""Puente al motor TypeScript de niveles."""
from __future__ import annotations

import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BRIDGE = ROOT / "scripts" / "flask-bridge.ts"


def _call(payload: dict) -> dict:
    import os
    env = {
        **os.environ,
        "DATABASE_URL": os.environ.get("DATABASE_URL", "file:./dev.db"),
        "SESSION_SECRET": os.environ.get(
            "SESSION_SECRET", "arcana-obscura-dev-secret-key-32chars-minimum-length"
        ),
    }
    tsx = ROOT / "node_modules" / ".bin" / ("tsx.cmd" if os.name == "nt" else "tsx")
    cmd = [str(tsx), str(BRIDGE)] if tsx.exists() else ["npx", "tsx", str(BRIDGE)]
    proc = subprocess.run(
        cmd,
        input=json.dumps(payload),
        capture_output=True,
        text=True,
        cwd=str(ROOT),
        env=env,
        shell=not tsx.exists(),
        timeout=60,
    )
    if proc.returncode != 0:
        raise RuntimeError(proc.stderr or proc.stdout or "bridge failed")
    return json.loads(proc.stdout)


def level_meta(level_id: int) -> dict:
    from .utils import load_json
    levels = load_json("levels_meta.json")
    for lv in levels:
        if lv["id"] == level_id:
            return lv
    return {"id": level_id, "title": f"Nivel {level_id}", "act": 1, "hints": [], "narrativeEntry": ""}


def generate_variant(level_id: int, context: dict) -> dict:
    out = _call({"action": "generate", "levelId": level_id, "context": context})
    return out["variant"]


def solve_level(level_id: int, context: dict) -> dict:
    out = _call({"action": "solve", "levelId": level_id, "context": context})
    return out


def validate_level(level_id: int, context: dict, payload: dict, variant: dict | None = None) -> dict:
    out = _call({
        "action": "validate",
        "levelId": level_id,
        "context": context,
        "payload": payload,
        "variant": variant,
    })
    return out["result"]
