"""Contexto de jugador y progreso."""
from __future__ import annotations

import json
from . import db
from .utils import seed_to_index

TOTAL_LEVELS = 100


def generate_level_order(seed: str, path: str | None = None) -> list[int]:
    """Orden aleatorio de los 100 niveles, determinista por semilla."""
    mix = f"{seed}:{path}" if path else seed
    levels = list(range(1, TOTAL_LEVELS + 1))
    for i in range(len(levels) - 1, 0, -1):
        j = seed_to_index(f"{mix}:lvl:{i}", i + 1)
        levels[i], levels[j] = levels[j], levels[i]
    if path == "right":
        mid = len(levels) // 2
        levels = levels[:mid] + list(reversed(levels[mid:]))
    elif path == "left":
        levels = list(reversed(levels))
    return levels


def get_level_order(context: dict) -> list[int]:
    order = context.get("levelOrder")
    if order:
        return order
    personality = context.get("personality") or {}
    game_seed = personality.get("gameSeed") or context.get("seed") or "default"
    path = context.get("thresholdPath")
    return generate_level_order(game_seed, path)


def get_next_level(context: dict) -> int | None:
    completed = set(context.get("completedLevels") or [])
    for level_id in get_level_order(context):
        if level_id not in completed:
            return level_id
    return None


def all_levels_complete(context: dict) -> bool:
    return len(context.get("completedLevels") or []) >= TOTAL_LEVELS


def can_access_level(context: dict, level_id: int) -> bool:
    completed = set(context.get("completedLevels") or [])
    if level_id in completed:
        return True
    return level_id == get_next_level(context)


def build_context(session_id: str) -> dict | None:
    row = db.get_session(session_id)
    if not row:
        return None
    ctx = db.session_to_context(row)
    if not ctx.get("levelOrder") and ctx.get("personality"):
        path = ctx.get("thresholdPath")
        order = generate_level_order(ctx["personality"].get("gameSeed", ctx["seed"]), path)
        db.update_session(session_id, level_order_json=json.dumps(order))
        ctx["levelOrder"] = order
    return ctx


def apply_threshold_path(session_id: str, context: dict, path: str) -> None:
    profile = context.get("personality") or {}
    game_seed = profile.get("gameSeed", context.get("seed"))
    order = generate_level_order(game_seed, path)
    narrative = dict(context.get("narrative") or {})
    narrative["thresholdChoice"] = path
    db.update_session(
        session_id,
        threshold_path=path,
        level_order_json=json.dumps(order),
        narrative_json=json.dumps(narrative),
    )


def arcane_seeds(row: dict) -> set[str]:
    import json as _json
    codes = _json.loads(row.get("arcane_codes_json") or "[]")
    unlocked = _json.loads(row.get("unlocked_codes_json") or "[]")
    seeds = {c.get("seed", "").lower() for c in codes}
    seeds |= {u.lower() for u in unlocked}
    return seeds


def archive_records(context: dict, row: dict) -> list[dict]:
    completed = set(context.get("completedLevels") or [])
    seeds = arcane_seeds(row)
    records = []
    if 43 in completed or 44 in completed or "keter" in seeds:
        records.append({"level": 43, "label": "Registro XLIII — Keter"})
    if 44 in completed or "la emperatriz" in seeds:
        records.append({"level": 44, "label": "Registro XLIV — Emperatriz"})
    if "el loco" in seeds and 99 not in completed:
        records.append({"level": 99, "label": "Atajo del Loco"})
    return records


def save_personality(session_id: str, profile: dict) -> None:
    order = generate_level_order(profile["gameSeed"])
    db.update_session(
        session_id,
        personality_json=json.dumps(profile),
        current_level=0,
        level_order_json=json.dumps(order),
        words_json=json.dumps([profile["borrowedName"]]),
        narrative_json=json.dumps({
            "borrowedName": profile["borrowedName"],
            "thresholdChoice": None,
        }),
    )


def apply_level_success(session_id: str, context: dict, level_id: int, result: dict, variant: dict) -> None:
    completed = list(set([*(context.get("completedLevels") or []), level_id]))
    narrative = dict(context.get("narrative") or {})
    words = list(context.get("words") or [])
    variants = dict(context.get("levelVariants") or {})
    variants[str(level_id)] = variant

    for c in result.get("consequences") or []:
        key = c.get("key")
        val = c.get("value")
        if key == "words" and isinstance(val, str):
            words.append(val)
        elif key:
            narrative[key] = val

    db.update_session(
        session_id,
        current_level=len(completed),
        completed_levels=json.dumps(completed),
        narrative_json=json.dumps(narrative),
        words_json=json.dumps(words),
        level_variants_json=json.dumps(variants),
        total_attempts=(context.get("attemptsTotal") or 0) + 1,
    )
    if len(completed) >= TOTAL_LEVELS:
        from .session_guard import enable_specter
        enable_specter(session_id, db)


def increment_attempts(session_id: str, context: dict) -> None:
    db.update_session(
        session_id,
        total_attempts=(context.get("attemptsTotal") or 0) + 1,
    )


def get_level_progress(session_id: str, level_id: int) -> dict:
    with db.get_conn() as conn:
        row = conn.execute(
            "SELECT * FROM level_progress WHERE session_id = ? AND level_id = ?",
            (session_id, level_id),
        ).fetchone()
    if not row:
        return {"attempts": 0, "hints_used": 0, "completed": False}
    return {
        "attempts": row["attempts"],
        "hints_used": row["hints_used"],
        "completed": bool(row["completed"]),
    }


def record_attempt(session_id: str, level_id: int, success: bool, variant: dict) -> dict:
    prog = get_level_progress(session_id, level_id)
    attempts = prog["attempts"] + 1
    with db.get_conn() as conn:
        conn.execute(
            """
            INSERT INTO level_progress (session_id, level_id, attempts, completed, variant_json)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(session_id, level_id) DO UPDATE SET
                attempts = excluded.attempts,
                completed = CASE WHEN excluded.completed = 1 THEN 1 ELSE level_progress.completed END,
                variant_json = excluded.variant_json
            """,
            (session_id, level_id, attempts, 1 if success else 0, json.dumps(variant)),
        )
    return {"attempts": attempts}
