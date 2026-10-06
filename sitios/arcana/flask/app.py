"""
ARCANA OBSCURA — Flask (UI tétrica, motor de niveles vía puente Node).
"""
from __future__ import annotations

import json
import os
import sys
from functools import wraps
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, g, jsonify, redirect, render_template, request, session, url_for

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))

load_dotenv(ROOT.parent / ".env")
load_dotenv(ROOT / ".env")

from game import admin_stats, bridge, codes, context, db, personality  # noqa: E402
from game import session_guard, webhook  # noqa: E402
from game.utils import generate_seed, sanitize_params  # noqa: E402

app = Flask(__name__)
app.secret_key = os.environ.get(
    "SESSION_SECRET", "arcana-obscura-dev-secret-key-32chars-minimum-length"
)
GAME_NAME = os.environ.get("GAME_NAME", "ARCANA OBSCURA")
DEV_MODE = os.environ.get("DEV_MODE", "true").lower() == "true"
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "arcana-dev")
FINAL_DESTINATION = os.environ.get(
    "FINAL_DESTINATION_LABEL", "Lugar ficticio — configurar antes del despliegue"
)
RUN_ID = generate_seed()

db.init_db()

SKIP_GUARD = frozenset({
    "index", "advertencia", "expirado", "static", "api_device", "admin",
})


@app.context_processor
def inject_globals():
    return {"game_name": GAME_NAME}


def get_sid() -> str | None:
    return session.get("sid")


def client_ip() -> str:
    forwarded = request.headers.get("X-Forwarded-For", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.remote_addr or "unknown"


def device_fp() -> str | None:
    return session.get("device_fp") or request.cookies.get("arcana_fp")


def _restore_existing(existing: str) -> str:
    session["sid"] = existing
    row = db.get_session(existing)
    if row:
        session["recovery"] = row["recovery_code"]
    return existing


def _blocked_by_identity() -> bool:
    ip = client_ip()
    fp = device_fp()
    if db.ip_has_participated(ip):
        existing = db.get_ip_session(ip)
        if existing and db.get_session(existing):
            if get_sid() != existing:
                _restore_existing(existing)
            return False
        return True
    if fp and db.fingerprint_has_participated(fp):
        existing = db.get_fingerprint_session(fp)
        if existing and db.get_session(existing):
            if get_sid() != existing:
                _restore_existing(existing)
            return False
        return True
    return False


def ensure_session(force_new: bool = False) -> str:
    sid = get_sid()
    if not force_new and sid and db.get_session(sid):
        return sid
    if _blocked_by_identity():
        return ""

    seed = generate_seed()
    recovery = db.recovery_code()
    arcane = codes.generate_arcane_codes(seed, RUN_ID)
    fp = device_fp()
    sid = db.create_session(
        seed, recovery,
        client_ip=client_ip(),
        arcane_codes=arcane,
        device_fingerprint=fp,
        expires_at=session_guard.expires_at_from_now(),
    )
    db.register_ip(client_ip(), sid, request.headers.get("User-Agent"))
    if fp:
        db.register_fingerprint(fp, sid)
    session["sid"] = sid
    session["recovery"] = recovery
    return sid


def require_session(f):
    @wraps(f)
    def wrapped(*args, **kwargs):
        if not get_sid():
            return redirect(url_for("index"))
        return f(*args, **kwargs)
    return wrapped


def _session_row():
    sid = get_sid()
    return sid, (db.get_session(sid) if sid else None)


@app.before_request
def guard_request():
    sid, row = _session_row()
    if not row:
        return
    g.prev_seen = row.get("last_seen_at")
    session_guard.touch_last_seen(sid, db)
    if request.endpoint in SKIP_GUARD or request.endpoint is None:
        return
    if session_guard.is_specter(row):
        return
    if session_guard.is_expired(row.get("expires_at")):
        return redirect(url_for("expirado"))


# --- API ---

@app.route("/api/device", methods=["POST"])
def api_device():
    data = request.get_json(silent=True) or {}
    fp = (data.get("fingerprint") or "").strip()
    if not fp or len(fp) > 64:
        return jsonify({"ok": False}), 400
    session["device_fp"] = fp
    sid = get_sid()
    if sid:
        db.update_session(sid, device_fingerprint=fp)
        db.register_fingerprint(fp, sid)
    resp = jsonify({"ok": True})
    resp.set_cookie("arcana_fp", fp, max_age=60 * 60 * 24 * 365, httponly=False, samesite="Lax")
    return resp


# --- Rutas públicas ---

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/advertencia", methods=["GET", "POST"])
def advertencia():
    ip = client_ip()
    if request.method == "POST":
        sid = ensure_session()
        if not sid:
            return render_template("bloqueado.html", ip=ip)
        return redirect(url_for("prueba"))
    if _blocked_by_identity() and not (get_sid() and db.get_session(get_sid())):
        return render_template("bloqueado.html", ip=ip)
    return render_template("advertencia.html")


@app.route("/expirado")
def expirado():
    return render_template("expirado.html")


@app.route("/prueba", methods=["GET", "POST"])
@require_session
def prueba():
    sid = get_sid()
    row = db.get_session(sid)
    if row and row.get("personality_json"):
        return redirect(url_for("resultado"))

    seed = row["seed"]
    questions = personality.select_questions(seed)
    answers_key = f"answers_{sid}"
    answers = session.get(answers_key, [])

    if request.method == "POST":
        qid = request.form.get("question_id")
        opt = request.form.get("option_index")
        if qid is not None and opt is not None:
            answers.append({"questionId": qid, "optionIndex": int(opt)})
            session[answers_key] = answers

        if len(answers) >= len(questions):
            profile = personality.build_profile(seed, answers)
            context.save_personality(sid, profile)
            session.pop(answers_key, None)
            return redirect(url_for("resultado"))
        return redirect(url_for("prueba"))

    q_index = len(answers) + 1
    if q_index > len(questions):
        return redirect(url_for("resultado"))
    question = questions[len(answers)]
    progress = (len(answers) / len(questions)) * 100
    return render_template(
        "prueba.html",
        question=question,
        q_index=q_index,
        q_total=len(questions),
        progress=progress,
    )


@app.route("/resultado")
@require_session
def resultado():
    sid = get_sid()
    ctx = context.build_context(sid)
    if not ctx or not ctx.get("personality"):
        return redirect(url_for("prueba"))
    row = db.get_session(sid) or {}
    arcane = json.loads(row.get("arcane_codes_json") or "[]")
    return render_template(
        "resultado.html",
        profile=ctx["personality"],
        arcane_codes=arcane,
    )


@app.route("/umbral", methods=["GET", "POST"])
@require_session
def umbral():
    sid = get_sid()
    ctx = context.build_context(sid)
    row = db.get_session(sid) or {}
    if not ctx or not ctx.get("personality"):
        return redirect(url_for("prueba"))

    if request.method == "POST" and not session_guard.is_specter(row):
        path = request.form.get("path")
        if path in ("left", "right") and not ctx.get("thresholdPath"):
            context.apply_threshold_path(sid, ctx, path)
            ctx = context.build_context(sid)

    completed = len(ctx.get("completedLevels") or [])
    need_choice = completed == 0 and not ctx.get("thresholdPath") and not session_guard.is_specter(row)
    next_level = None if need_choice else context.get_next_level(ctx)

    return render_template(
        "umbral.html",
        next_level=next_level,
        need_choice=need_choice,
    )


# --- Niveles ---

@app.route("/nivel/<int:numero>", methods=["GET", "POST"])
@require_session
def nivel(numero: int):
    if numero < 1 or numero > 100:
        return "Nivel inválido", 400

    sid = get_sid()
    row = db.get_session(sid) or {}
    ctx = context.build_context(sid)
    if not ctx or not ctx.get("personality"):
        return redirect(url_for("prueba"))

    if session_guard.is_specter(row):
        return redirect(url_for("umbral"))

    if not context.can_access_level(ctx, numero):
        return redirect(url_for("umbral"))

    meta = bridge.level_meta(numero)
    success = False
    body_class = ""

    try:
        variant = bridge.generate_variant(numero, ctx)
    except RuntimeError as e:
        return f"Error del motor de niveles: {e}", 500

    params = sanitize_params(variant.get("params") or {})
    ui_type = params.get("uiType", "text")

    if request.method == "POST":
        raw = request.form.get("payload") or "{}"
        try:
            payload = json.loads(raw)
        except json.JSONDecodeError:
            payload = {"answer": raw}

        try:
            result = bridge.validate_level(numero, ctx, payload, variant)
        except RuntimeError:
            result = {"success": False}

        context.record_attempt(sid, numero, result.get("success", False), variant)

        if result.get("success"):
            context.apply_level_success(sid, ctx, numero, result, variant)
            ctx = context.build_context(sid)
            success = True
            if context.all_levels_complete(ctx):
                webhook.notify_completion(sid, ctx.get("personality") or {}, client_ip())
        else:
            context.increment_attempts(sid, ctx)
            body_class = "fail-pulse"

    prog = context.get_level_progress(sid, numero)
    narrative = variant.get("narrativeOverride") or meta.get("narrativeEntry", "")
    next_level = context.get_next_level(ctx)
    done = context.all_levels_complete(ctx)

    return render_template(
        "nivel.html",
        level={"id": meta["id"], "narrative": narrative},
        params=params,
        ui_type=ui_type,
        success=success or prog["completed"],
        next_level=next_level if (success or prog["completed"]) else None,
        game_complete=done,
        body_class=body_class,
    )


@app.route("/final")
@require_session
def final():
    ctx = context.build_context(get_sid())
    if not ctx or not context.all_levels_complete(ctx):
        return redirect(url_for("umbral"))
    return render_template("final.html", destination_label=FINAL_DESTINATION)


@app.route("/certificado")
@require_session
def certificado():
    sid = get_sid()
    ctx = context.build_context(sid)
    row = db.get_session(sid) or {}
    if not ctx or not context.all_levels_complete(ctx):
        return redirect(url_for("umbral"))
    arcane = json.loads(row.get("arcane_codes_json") or "[]")
    return render_template(
        "certificado.html",
        profile=ctx["personality"],
        arcane_codes=arcane,
        completed_at=row.get("completed_at") or "—",
        run_id=RUN_ID,
    )


@app.route("/admin", methods=["GET", "POST"])
def admin():
    if not DEV_MODE:
        return "No disponible", 404
    authed = session.get("admin") is True
    error = None
    if request.method == "POST" and not authed:
        if request.form.get("password") == ADMIN_PASSWORD:
            session["admin"] = True
            authed = True
        else:
            error = "Contraseña incorrecta"
    stats = {}
    ip_list = []
    if authed:
        stats = admin_stats.admin_stats()
        ip_list = db.list_participated_ips()
    return render_template(
        "admin.html", authed=authed, error=error, stats=stats, ip_list=ip_list, run_id=RUN_ID,
    )


if __name__ == "__main__":
    port = int(os.environ.get("FLASK_PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=DEV_MODE)
