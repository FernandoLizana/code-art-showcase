"""Estadísticas para el panel admin."""
from __future__ import annotations

import json
from . import db


def admin_stats() -> dict:
    with db.get_conn() as conn:
        sessions = conn.execute("SELECT COUNT(*) FROM sessions").fetchone()[0]
        with_personality = conn.execute(
            "SELECT COUNT(*) FROM sessions WHERE personality_json IS NOT NULL"
        ).fetchone()[0]
        completed_100 = conn.execute(
            "SELECT COUNT(*) FROM sessions WHERE specter_mode = 1"
        ).fetchone()[0]
        dropout = conn.execute(
            """SELECT COUNT(*) FROM sessions
               WHERE personality_json IS NULL AND id IN (SELECT session_id FROM participated_ips)"""
        ).fetchone()[0]

        failed_levels = conn.execute(
            """
            SELECT level_id, SUM(CASE WHEN completed = 0 THEN attempts ELSE 0 END) AS fails
            FROM level_progress
            GROUP BY level_id
            ORDER BY fails DESC
            LIMIT 5
            """
        ).fetchall()

        avg_attempts = conn.execute(
            "SELECT AVG(total_attempts) FROM sessions WHERE personality_json IS NOT NULL"
        ).fetchone()[0]

    return {
        "sessions": sessions,
        "with_personality": with_personality,
        "completed_100": completed_100,
        "dropout": dropout,
        "avg_attempts": round(avg_attempts or 0, 1),
        "top_failed": [{"level": r["level_id"], "fails": r["fails"]} for r in failed_levels],
    }
