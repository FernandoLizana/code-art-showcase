"""Mensajes de la entidad en el cuaderno."""
from __future__ import annotations

import random

ENTITY_LINES = [
    "No escribí esto. Tú tampoco deberías leerlo.",
    "Llevas contando desde que llegaste. Yo también.",
    "Algunas respuestas te siguen. No todas son tuyas.",
    "El silencio entre niveles no está vacío.",
    "Tu nombre prestado ya lo usó alguien antes.",
    "Fallaste lo suficiente como para que me fije.",
    "No cierres la pestaña. Ya lo hiciste una vez.",
    "Los códigos no son decoración. Son huellas.",
    "Hay una puerta que no aparece en tu orden. Aún.",
    "Cuando termines, seguiré aquí. Es lo que hago.",
]

TRIGGER_LEVELS = {13, 33, 66, 88}


def maybe_entity_message(
    narrative: dict,
    total_attempts: int,
    completed_levels: list[int],
    just_failed: bool = False,
    just_completed_level: int | None = None,
) -> str | None:
    sent = set(narrative.get("entityMessages") or [])
    if just_completed_level in TRIGGER_LEVELS:
        key = f"lvl:{just_completed_level}"
        if key not in sent:
            return _pick(sent, key)

    if just_failed and total_attempts > 0 and total_attempts % 7 == 0:
        key = f"fail:{total_attempts}"
        if key not in sent:
            return _pick(sent, key)

    if len(completed_levels) == 1 and "first" not in sent:
        return _pick(sent, "first")

    return None


def _pick(sent: set, key: str) -> str:
    available = [l for i, l in enumerate(ENTITY_LINES) if f"line:{i}" not in sent]
    if not available:
        available = ENTITY_LINES
    line = random.choice(available)
    return line
