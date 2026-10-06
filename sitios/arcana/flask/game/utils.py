"""Utilidades compartidas del juego."""
from __future__ import annotations

import hashlib
import json
import re
import secrets
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent / "data"

ACCENT_MAP = str.maketrans(
    "áéíóúüñàèìòù",
    "aeiouunaeiou",
)


def normalize_answer(text: str) -> str:
    t = text.lower().strip()
    t = re.sub(r"^(la|el|los|las|the)\s+", "", t)
    t = re.sub(r"\s+", " ", t)
    return t.translate(ACCENT_MAP)


def answers_match(a: str, b: str) -> bool:
    return normalize_answer(a) == normalize_answer(b)


def matches_any(text: str, variants: list[str]) -> bool:
    n = normalize_answer(text)
    return any(normalize_answer(v) == n for v in variants)


def seed_to_index(seed: str, max_val: int) -> int:
    h = 0
    for c in seed:
        h = ((h << 5) - h + ord(c)) & 0xFFFFFFFF
        if h > 0x7FFFFFFF:
            h -= 0x100000000
    return abs(h) % max_val


def generate_seed() -> str:
    return secrets.token_hex(16)


def derive_seed(base: str, *parts: str | int) -> str:
    raw = ":".join([base] + [str(p) for p in parts])
    return hashlib.sha256(raw.encode()).hexdigest()[:16]


def load_json(name: str):
    with open(DATA_DIR / name, encoding="utf-8") as f:
        return json.load(f)


def sanitize_params(params: dict) -> dict:
    sensitive = {
        "answer", "acceptedAnswers", "missingCardId", "missingCardName",
        "sequence", "sequenceJoined", "inactiveMark", "correctIndex",
        "correctId", "correctAnswer", "correctChoice", "correctAction",
        "expectedOrder", "shadowId", "wrongIndex", "solution", "validPairs",
        "reversedName", "pattern", "correctCardId", "correctWord",
        "entityName", "missingArcanaId",
    }
    return {k: v for k, v in params.items() if k not in sensitive}
