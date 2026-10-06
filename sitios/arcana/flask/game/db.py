"""SQLite + sesiones de juego."""
from __future__ import annotations

import json
import sqlite3
from contextlib import contextmanager
from pathlib import Path

DB_PATH = Path(__file__).resolve().parents[1] / "arcana.db"


def init_db() -> None:
    with get_conn() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                seed TEXT NOT NULL,
                recovery_code TEXT UNIQUE NOT NULL,
                personality_json TEXT,
                current_level INTEGER DEFAULT 0,
                completed_levels TEXT DEFAULT '[]',
                narrative_json TEXT DEFAULT '{}',
                words_json TEXT DEFAULT '[]',
                level_variants_json TEXT DEFAULT '{}',
                total_attempts INTEGER DEFAULT 0,
                total_hints_used INTEGER DEFAULT 0,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS level_progress (
                session_id TEXT,
                level_id INTEGER,
                completed INTEGER DEFAULT 0,
                attempts INTEGER DEFAULT 0,
                hints_used INTEGER DEFAULT 0,
                variant_json TEXT DEFAULT '{}',
                PRIMARY KEY (session_id, level_id)
            );
            CREATE TABLE IF NOT EXISTS notebook (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT,
                content TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS participated_ips (
                ip TEXT PRIMARY KEY,
                session_id TEXT NOT NULL,
                user_agent TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS participated_fingerprints (
                fingerprint TEXT PRIMARY KEY,
                session_id TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
            """
        )
        _migrate(conn)


def _migrate(conn: sqlite3.Connection) -> None:
    cols = {row[1] for row in conn.execute("PRAGMA table_info(sessions)").fetchall()}
    for col, typedef in [
        ("client_ip", "TEXT"),
        ("arcane_codes_json", "TEXT"),
        ("level_order_json", "TEXT"),
        ("device_fingerprint", "TEXT"),
        ("expires_at", "TEXT"),
        ("specter_mode", "INTEGER DEFAULT 0"),
        ("completed_at", "TEXT"),
        ("last_seen_at", "TEXT"),
        ("threshold_path", "TEXT"),
        ("unlocked_codes_json", "TEXT DEFAULT '[]'"),
    ]:
        if col not in cols:
            conn.execute(f"ALTER TABLE sessions ADD COLUMN {col} {typedef}")

    nb_cols = {row[1] for row in conn.execute("PRAGMA table_info(notebook)").fetchall()}
    if "author" not in nb_cols:
        conn.execute("ALTER TABLE notebook ADD COLUMN author TEXT DEFAULT 'player'")


@contextmanager
def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def create_session(
    seed: str,
    recovery: str,
    client_ip: str | None = None,
    arcane_codes: list | None = None,
    device_fingerprint: str | None = None,
    expires_at: str | None = None,
) -> str:
    import uuid
    sid = str(uuid.uuid4())
    with get_conn() as conn:
        conn.execute(
            """INSERT INTO sessions
               (id, seed, recovery_code, client_ip, arcane_codes_json,
                device_fingerprint, expires_at, last_seen_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)""",
            (sid, seed, recovery, client_ip, json.dumps(arcane_codes or []),
             device_fingerprint, expires_at),
        )
    return sid


def get_session(session_id: str) -> dict | None:
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM sessions WHERE id = ?", (session_id,)).fetchone()
    if not row:
        return None
    return dict(row)


def update_session(session_id: str, **fields) -> None:
    if not fields:
        return
    cols = ", ".join(f"{k} = ?" for k in fields)
    vals = list(fields.values()) + [session_id]
    with get_conn() as conn:
        conn.execute(f"UPDATE sessions SET {cols} WHERE id = ?", vals)


def session_to_context(row: dict) -> dict:
    personality = json.loads(row["personality_json"]) if row.get("personality_json") else None
    level_order = json.loads(row["level_order_json"]) if row.get("level_order_json") else None
    return {
        "sessionId": row["id"],
        "seed": row["seed"],
        "personality": personality,
        "currentLevel": row.get("current_level") or 0,
        "completedLevels": json.loads(row.get("completed_levels") or "[]"),
        "levelOrder": level_order,
        "thresholdPath": row.get("threshold_path"),
        "specterMode": bool(row.get("specter_mode")),
        "expiresAt": row.get("expires_at"),
        "unlockedCodes": json.loads(row.get("unlocked_codes_json") or "[]"),
        "narrative": json.loads(row.get("narrative_json") or "{}"),
        "cardsSeen": [],
        "symbols": [],
        "words": json.loads(row.get("words_json") or "[]"),
        "levelVariants": json.loads(row.get("level_variants_json") or "{}"),
        "hintsUsedTotal": row.get("total_hints_used") or 0,
        "attemptsTotal": row.get("total_attempts") or 0,
        "entityState": {},
    }


def recovery_code() -> str:
    import random
    chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    return "".join(random.choice(chars) for _ in range(12))


def register_ip(ip: str, session_id: str, user_agent: str | None = None) -> None:
    with get_conn() as conn:
        conn.execute(
            """INSERT OR IGNORE INTO participated_ips (ip, session_id, user_agent)
               VALUES (?, ?, ?)""",
            (ip, session_id, user_agent),
        )


def ip_has_participated(ip: str) -> bool:
    with get_conn() as conn:
        row = conn.execute(
            "SELECT 1 FROM participated_ips WHERE ip = ?", (ip,)
        ).fetchone()
    return row is not None


def get_ip_session(ip: str) -> str | None:
    with get_conn() as conn:
        row = conn.execute(
            "SELECT session_id FROM participated_ips WHERE ip = ?", (ip,)
        ).fetchone()
    return row["session_id"] if row else None


def register_fingerprint(fingerprint: str, session_id: str) -> None:
    with get_conn() as conn:
        conn.execute(
            "INSERT OR IGNORE INTO participated_fingerprints (fingerprint, session_id) VALUES (?, ?)",
            (fingerprint, session_id),
        )


def fingerprint_has_participated(fingerprint: str) -> bool:
    with get_conn() as conn:
        row = conn.execute(
            "SELECT 1 FROM participated_fingerprints WHERE fingerprint = ?", (fingerprint,)
        ).fetchone()
    return row is not None


def get_fingerprint_session(fingerprint: str) -> str | None:
    with get_conn() as conn:
        row = conn.execute(
            "SELECT session_id FROM participated_fingerprints WHERE fingerprint = ?",
            (fingerprint,),
        ).fetchone()
    return row["session_id"] if row else None


def add_notebook_entry(session_id: str, content: str, author: str = "player") -> None:
    with get_conn() as conn:
        conn.execute(
            "INSERT INTO notebook (session_id, content, author) VALUES (?, ?, ?)",
            (session_id, content[:5000], author),
        )


def list_participated_ips() -> list[dict]:
    with get_conn() as conn:
        rows = conn.execute(
            """
            SELECT p.ip, p.session_id, p.user_agent, p.created_at,
                   s.personality_json IS NOT NULL AS completed_test,
                   s.specter_mode AS finished_game
            FROM participated_ips p
            LEFT JOIN sessions s ON s.id = p.session_id
            ORDER BY p.created_at DESC
            """
        ).fetchall()
    return [dict(r) for r in rows]
