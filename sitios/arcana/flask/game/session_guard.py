"""Caducidad, regreso, modo espectro."""
from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone

SESSION_HOURS = int(__import__("os").environ.get("SESSION_HOURS", "8"))
RETURN_GAP_MINUTES = 30


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _parse(ts: str | None) -> datetime | None:
    if not ts:
        return None
    try:
        return datetime.fromisoformat(ts.replace("Z", "+00:00"))
    except ValueError:
        return None


def expires_at_from_now() -> str:
    return (_now() + timedelta(hours=SESSION_HOURS)).isoformat()


def is_expired(expires_at: str | None) -> bool:
    exp = _parse(expires_at)
    return exp is not None and _now() > exp


def absence_message(last_seen: str | None, has_progress: bool) -> str | None:
    if not has_progress or not last_seen:
        return None
    seen = _parse(last_seen)
    if not seen:
        return None
    gap = (_now() - seen).total_seconds() / 60
    if gap < RETURN_GAP_MINUTES:
        return None
    return "Te fuiste. Algo se quedó mirando por ti."


def touch_last_seen(session_id: str, db_module) -> None:
    db_module.update_session(session_id, last_seen_at=_now().isoformat())


def enable_specter(session_id: str, db_module) -> None:
    db_module.update_session(
        session_id,
        specter_mode=1,
        completed_at=_now().isoformat(),
    )


def is_specter(row: dict) -> bool:
    return bool(row.get("specter_mode"))
