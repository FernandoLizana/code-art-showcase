"""Códigos encriptados derivados de semillas arcanas."""
from __future__ import annotations

import hashlib
import hmac
from .utils import derive_seed, normalize_answer

# Semillas temáticas — base simbólica de cada código
THEMATIC_SEEDS = [
    "el loco",
    "keter",
    "la emperatriz",
    "el ermitaño",
    "la sacerdotisa",
    "thaumiel",
    "malkuth",
    "binah",
    "el juicio",
    "la torre",
    "chokmah",
    "yesod",
]

_CIPHER_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"


def _digest(thematic: str, session_seed: str, run_id: str, index: int) -> bytes:
    material = f"{normalize_answer(thematic)}|{session_seed}|{run_id}|{index}"
    return hmac.new(
        derive_seed(thematic, run_id).encode(),
        material.encode(),
        hashlib.sha256,
    ).digest()


def _to_cipher(raw: bytes, length: int = 16) -> str:
    out = []
    for i in range(length):
        out.append(_CIPHER_ALPHABET[raw[i % len(raw)] % len(_CIPHER_ALPHABET)])
    s = "".join(out)
    if length <= 8:
        mid = length // 2
        return f"{s[:mid]}-{s[mid:]}"
    return f"{s[:4]}-{s[4:8]}-{s[8:12]}-{s[12:16]}"


def generate_arcane_codes(session_seed: str, run_id: str, count: int = 6) -> list[dict]:
    """Genera códigos únicos por sesión y por ejecución del servidor."""
    codes = []
    for i, theme in enumerate(THEMATIC_SEEDS):
        if i >= count:
            break
        raw = _digest(theme, session_seed, run_id, i)
        codes.append({
            "seed": theme,
            "cipher": _to_cipher(raw),
            "sigil": _to_cipher(raw[8:], length=8),
        })
    # Mezclar orden de presentación según semilla de sesión
    from .utils import seed_to_index
    shuffled = list(codes)
    for i in range(len(shuffled) - 1, 0, -1):
        j = seed_to_index(f"{session_seed}:codes:{i}", i + 1)
        shuffled[i], shuffled[j] = shuffled[j], shuffled[i]
    return shuffled
