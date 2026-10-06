"""Fragmentos de lore desbloqueables."""
from __future__ import annotations

FRAGMENTS = [
    {
        "id": "f01",
        "title": "Sobre el umbral",
        "text": "No entraste por curiosidad. Entraste porque algo ya te había elegido.",
        "unlock": {"min_completed": 0, "code_seed": None},
    },
    {
        "id": "f02",
        "title": "Keter",
        "text": "Clase Keter: no porque sea imposible contenerlo, sino porque olvidas que debe estarlo.",
        "unlock": {"min_completed": 0, "code_seed": "keter"},
    },
    {
        "id": "f03",
        "title": "El Loco",
        "text": "El primero del mazo camina sin mapa. Los demás creen que lo siguen.",
        "unlock": {"min_completed": 3, "code_seed": "el loco"},
    },
    {
        "id": "f04",
        "title": "La Emperatriz",
        "text": "Lo fecundo no siempre es benigno. A veces solo es inevitable.",
        "unlock": {"min_completed": 10, "code_seed": "la emperatriz"},
    },
    {
        "id": "f05",
        "title": "Thaumiel",
        "text": "Dos entidades en equilibrio imperfecto. Una contiene a la otra. ¿Cuál eres tú?",
        "unlock": {"min_completed": 25, "code_seed": "thaumiel"},
    },
    {
        "id": "f06",
        "title": "Registro negado",
        "text": "Algunos niveles no existen en el archivo. El archivo miente de todos modos.",
        "unlock": {"min_completed": 50, "code_seed": None},
    },
    {
        "id": "f07",
        "title": "La Sacerdotisa",
        "text": "Lo que no se nombra sigue siendo real. Lo que se nombra deja de pertenecerte.",
        "unlock": {"min_completed": 50, "code_seed": "la sacerdotisa"},
    },
    {
        "id": "f08",
        "title": "Malkuth",
        "text": "Reino de la materia. Aquí todo pesa. Hasta los símbolos.",
        "unlock": {"min_completed": 75, "code_seed": "malkuth"},
    },
    {
        "id": "f09",
        "title": "El Juicio",
        "text": "No te juzgan. Te recuerdan lo que hiciste cuando creías que nadie miraba.",
        "unlock": {"min_completed": 90, "code_seed": "el juicio"},
    },
    {
        "id": "f10",
        "title": "Cierre",
        "text": "Has leído hasta el final. Eso también queda registrado.",
        "unlock": {"min_completed": 100, "code_seed": None},
    },
]


def unlocked_fragments(completed_count: int, arcane_codes: list[dict], entered_codes: list[str]) -> list[dict]:
    code_seeds = {c.get("seed", "").lower() for c in arcane_codes}
    code_seeds |= {c.lower().strip() for c in entered_codes}
    out = []
    for frag in FRAGMENTS:
        u = frag["unlock"]
        if completed_count < u["min_completed"]:
            continue
        if u["code_seed"] and u["code_seed"] not in code_seeds:
            continue
        out.append(frag)
    return out
