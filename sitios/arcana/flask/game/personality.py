"""Prueba de personalidad — Python puro."""
from __future__ import annotations

from .utils import derive_seed, load_json, seed_to_index

QUESTIONS = load_json("questions.json")
QUESTION_COUNT = 10
DIMENSIONS = [
    "picardia", "bondad", "dominancia", "sumision", "impulsividad", "paciencia",
    "pensamiento_logico", "pensamiento_intuitivo", "escepticismo", "apertura_simbolica",
    "curiosidad", "prudencia", "empatia", "individualismo", "perfeccionismo",
    "tolerancia_ambiguedad", "necesidad_control", "capacidad_renuncia",
]

ARCHETYPES = [
    {"id": "observador", "name": "El Observador", "tarot": "La Sacerdotisa", "tarotId": 2,
     "dims": ["paciencia", "escepticismo", "prudencia"]},
    {"id": "tramposo", "name": "El Tramposo", "tarot": "El Mago", "tarotId": 1,
     "dims": ["picardia", "impulsividad", "curiosidad"]},
    {"id": "guardian", "name": "El Guardián", "tarot": "La Emperatriz", "tarotId": 3,
     "dims": ["bondad", "empatia", "prudencia"]},
    {"id": "dominante", "name": "El Dominante", "tarot": "El Emperador", "tarotId": 4,
     "dims": ["dominancia", "necesidad_control", "pensamiento_logico"]},
    {"id": "errante", "name": "El Errante", "tarot": "El Loco", "tarotId": 0,
     "dims": ["curiosidad", "pensamiento_intuitivo", "tolerancia_ambiguedad"]},
    {"id": "analista", "name": "El Analista", "tarot": "El Ermitaño", "tarotId": 9,
     "dims": ["pensamiento_logico", "perfeccionismo", "escepticismo"]},
    {"id": "mistico", "name": "El Místico", "tarot": "La Estrella", "tarotId": 17,
     "dims": ["apertura_simbolica", "pensamiento_intuitivo", "tolerancia_ambiguedad"]},
    {"id": "equilibrista", "name": "El Equilibrista", "tarot": "La Justicia", "tarotId": 11,
     "dims": ["tolerancia_ambiguedad", "paciencia", "capacidad_renuncia"]},
]

BORROWED = [
    "Mara Vex", "Silas Thorn", "Iris Noctis", "Caelum Ash", "Vera Hollow",
    "Orin Vale", "Lyra Moth", "Dorian Veil", "Nyx Calder", "Ember Solis",
]

MODIFIER_MAP = {
    "impulsividad": "require_patience",
    "paciencia": "require_quick_action",
    "picardia": "reward_honesty",
    "bondad": "require_boundaries",
    "pensamiento_logico": "favor_intuition",
    "pensamiento_intuitivo": "favor_logic",
    "curiosidad": "resist_curiosity",
    "dominancia": "reduce_control",
    "sumision": "require_initiative",
}


def select_questions(seed: str, count: int = QUESTION_COUNT) -> list:
    """Elige `count` preguntas distintas, variadas según la semilla de sesión."""
    qs = list(QUESTIONS)
    for i in range(len(qs) - 1, 0, -1):
        j = seed_to_index(f"{seed}:pool:{i}", i + 1)
        qs[i], qs[j] = qs[j], qs[i]
    selected = qs[:count]
    for i in range(len(selected) - 1, 0, -1):
        j = seed_to_index(f"{seed}:order:{i}", i + 1)
        selected[i], selected[j] = selected[j], selected[i]
    return selected


def score_answers(answers: list[dict]) -> dict[str, int]:
    scores = {d: 0 for d in DIMENSIONS}
    qmap = {q["id"]: q for q in QUESTIONS}
    for a in answers:
        q = qmap.get(a["questionId"])
        if not q:
            continue
        opt = q["options"][a["optionIndex"]]
        for dim, val in opt.get("scores", {}).items():
            if dim in scores:
                scores[dim] += val
    return scores


def build_profile(session_seed: str, answers: list[dict]) -> dict:
    scores = score_answers(answers)
    dominant = max(scores, key=scores.get)
    avoided = min(scores, key=scores.get)
    ranked = sorted(
        ARCHETYPES,
        key=lambda a: sum(scores.get(d, 0) for d in a["dims"]),
        reverse=True,
    )
    primary = ranked[0]
    secondary = ranked[1] if len(ranked) > 1 else ranked[0]
    game_seed = derive_seed(session_seed, primary["id"], dominant)
    modifiers = list({MODIFIER_MAP.get(dominant, "require_patience"),
                      MODIFIER_MAP.get(avoided, "favor_logic")})
    borrowed = BORROWED[seed_to_index(game_seed, len(BORROWED))]
    return {
        "scores": scores,
        "primaryArchetype": primary["name"],
        "secondaryArchetype": secondary["name"],
        "dominantDimension": dominant,
        "avoidedDimension": avoided,
        "tarotCard": primary["tarot"],
        "tarotCardId": primary["tarotId"],
        "gameSeed": game_seed,
        "contraryModifiers": modifiers,
        "borrowedName": borrowed,
    }
