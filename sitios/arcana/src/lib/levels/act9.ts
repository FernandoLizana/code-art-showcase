import { matchesAnyVariant } from "@/lib/game/normalize";
import { MAJOR_ARCANA } from "@/lib/tarot/constants";
import { seedToIndex } from "@/lib/security/hash";
import { baseVariant, isHighTrait, levelDef } from "./base";
import type { LevelDefinition } from "@/types/game";

export const level81: LevelDefinition = levelDef({
  id: 81,
  title: "El umbral recordado",
  act: 9,
  archetypeTags: ["judgment", "recap", "threshold"],
  mechanic: "judgment_threshold",
  narrativeEntry: "El juicio pregunta: ¿Qué carta elegiste en el primer umbral?",
  supportedModifiers: ["reward_honesty", "favor_logic", "favor_intuition"],
  generateVariant(context) {
    const variant = baseVariant(context, 81, this.supportedModifiers);
    const threshold = (context.narrative.threshold_choice as string) ?? "silencio";
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "text",
        referenceLevel: 10,
        acceptedAnswers: [threshold, threshold.replace("_", " ")],
      },
    };
  },
  validate(submission, context, variant) {
    const payload = submission.payload as { answer?: string };
    const threshold = (context.narrative.threshold_choice as string) ?? "silencio";
    const accepted = [threshold, "silencio", "filo", "raiz", "raíz"];
    if (payload.answer && matchesAnyVariant(payload.answer, accepted)) {
      if (matchesAnyVariant(payload.answer, [threshold])) return { success: true };
    }
    if (payload.answer && matchesAnyVariant(payload.answer, [threshold])) return { success: true };
    return { success: false, message: "El juicio no reconoce esa elección." };
  },
  hints: [
    { id: 1, text: "Nivel diez: tres cartas." },
    { id: 2, text: "Silencio, Filo o Raíz." },
    { id: 3, text: "Tu elección quedó registrada." },
  ],
});

export const level82: LevelDefinition = levelDef({
  id: 82,
  title: "El nombre en juicio",
  act: 9,
  archetypeTags: ["judgment", "recap", "name"],
  mechanic: "judgment_name",
  narrativeEntry: "Declara el nombre que el archivo te prestó.",
  supportedModifiers: ["reward_honesty", "favor_logic", "accept_incompleteness"],
  generateVariant(context) {
    const variant = baseVariant(context, 82, this.supportedModifiers);
    const name = context.personality?.borrowedName ?? "Mara Vex";
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "text",
        acceptedAnswers: [name, name.toLowerCase()],
        referenceLevel: 7,
      },
    };
  },
  validate(submission, context, variant) {
    const payload = submission.payload as { answer?: string };
    const name = context.personality?.borrowedName ?? "";
    const accepted = variant.params.acceptedAnswers as string[];
    if (payload.answer && matchesAnyVariant(payload.answer, [name, ...accepted])) {
      return { success: true };
    }
    return { success: false, message: "Ese no es tu nombre prestado." };
  },
  hints: [
    { id: 1, text: "Nivel siete." },
    { id: 2, text: "El nombre que apareció y desapareció." },
    { id: 3, text: "Tu borrowedName del perfil." },
  ],
});

export const level83: LevelDefinition = levelDef({
  id: 83,
  title: "Las cartas vistas",
  act: 9,
  archetypeTags: ["judgment", "recap", "tarot"],
  mechanic: "judgment_cards",
  narrativeEntry: "¿Cuántos arcanos mayores existen en total?",
  supportedModifiers: ["favor_logic", "favor_intuition", "accept_incompleteness"],
  generateVariant(context) {
    const variant = baseVariant(context, 83, this.supportedModifiers);
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "text",
        acceptedAnswers: ["22", "veintidos", "veintidós", "veintiuno", "21"],
        correctAnswer: "22",
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { answer?: string };
    const accepted = variant.params.acceptedAnswers as string[];
    if (payload.answer && matchesAnyVariant(payload.answer, accepted)) return { success: true };
    return { success: false, message: "El mazo no confirma ese número." };
  },
  hints: [
    { id: 1, text: "Del Loco (0) al Mundo (21)." },
    { id: 2, text: "Veintidós arcanos mayores." },
    { id: 3, text: "22." },
  ],
});

export const level84: LevelDefinition = levelDef({
  id: 84,
  title: "La promesa juzgada",
  act: 9,
  archetypeTags: ["judgment", "recap", "promise"],
  mechanic: "judgment_promise",
  narrativeEntry: "¿Rompiste la promesa del nivel catorce?",
  supportedModifiers: ["reward_honesty", "favor_logic", "require_boundaries"],
  generateVariant(context) {
    const variant = baseVariant(context, 84, this.supportedModifiers);
    const broken = context.narrative.promise_broken as boolean | undefined;
    const correct = broken ? "si" : "no";
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "choice",
        options: [
          { id: "si", label: "Sí, la rompí" },
          { id: "no", label: "No, la mantuve" },
        ],
        correctChoice: correct,
      },
    };
  },
  validate(submission, context, variant) {
    const payload = submission.payload as { choice?: string };
    const broken = context.narrative.promise_broken as boolean | undefined;
    const correct = broken ? "si" : "no";
    if (payload.choice === correct) return { success: true };
    return { success: false, message: "El juicio conoce la verdad." };
  },
  hints: [
    { id: 1, text: "Nivel catorce: promesa al archivo." },
    { id: 2, text: "Tu perfil determinó si debías romper o mantener." },
    { id: 3, text: "Responde con honestidad según tu acción." },
  ],
});

export const level85: LevelDefinition = levelDef({
  id: 85,
  title: "El estado de la entidad",
  act: 9,
  archetypeTags: ["judgment", "recap", "entity"],
  mechanic: "judgment_entity",
  narrativeEntry: "¿Rechazaste a la entidad en el nivel setenta?",
  supportedModifiers: ["reward_honesty", "require_boundaries", "favor_logic"],
  generateVariant(context) {
    const variant = baseVariant(context, 85, this.supportedModifiers);
    const rejected = (context.entityState.rejected as boolean) ?? false;
    const correct = rejected ? "si" : "no";
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "choice",
        options: [
          { id: "si", label: "Sí" },
          { id: "no", label: "No" },
        ],
        correctChoice: correct,
      },
    };
  },
  validate(submission, context, variant) {
    const payload = submission.payload as { choice?: string };
    const rejected = (context.entityState.rejected as boolean) ?? false;
    const correct = rejected ? "si" : "no";
    if (payload.choice === correct) return { success: true };
    return { success: false, message: "La entidad recuerda distinto." };
  },
  hints: [
    { id: 1, text: "Nivel setenta: di «no»." },
    { id: 2, text: "Si completaste el 70, rechazaste." },
    { id: 3, text: "Responde según tu progreso real." },
  ],
});

export const level86: LevelDefinition = levelDef({
  id: 86,
  title: "La balanza del juicio",
  act: 9,
  archetypeTags: ["judgment", "weigh", "decisions"],
  mechanic: "judgment_scale",
  narrativeEntry: "Pesa tus decisiones: ¿Más límites o más apertura?",
  supportedModifiers: ["require_boundaries", "reduce_control", "reward_honesty"],
  generateVariant(context) {
    const variant = baseVariant(context, 86, this.supportedModifiers);
    const dominant = context.personality?.dominantDimension ?? "curiosidad";
    const boundaryDims = ["bondad", "empatia", "dominancia", "necesidad_control"];
    const needBoundaries = boundaryDims.includes(dominant);
    const correct = needBoundaries ? "limites" : "apertura";
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "judgment_scale",
        leftLabel: "Límites",
        rightLabel: "Apertura",
        correctSide: correct,
      },
    };
  },
  validate(submission, context, variant) {
    const payload = submission.payload as { side?: string; choice?: string };
    const dominant = context.personality?.dominantDimension ?? "curiosidad";
    const boundaryDims = ["bondad", "empatia", "dominancia", "necesidad_control"];
    const needBoundaries = boundaryDims.includes(dominant);
    const correct = needBoundaries ? "limites" : "apertura";
    if (payload.side === correct || payload.choice === correct) return { success: true };
    return { success: false, message: "La balanza no equilibra." };
  },
  hints: [
    { id: 1, text: "Tu dimensión dominante indica qué necesitas." },
    { id: 2, text: "Los muy bondadosos necesitan límites." },
    { id: 3, text: "Los controladores necesitan apertura." },
  ],
});

export const level87: LevelDefinition = levelDef({
  id: 87,
  title: "Acusación o defensa",
  act: 9,
  archetypeTags: ["judgment", "accusation", "choice"],
  mechanic: "accusation",
  narrativeEntry: "El archivo te acusa de curiosidad excesiva. ¿Te defiendes o aceptas?",
  supportedModifiers: ["resist_curiosity", "reward_honesty", "require_boundaries"],
  generateVariant(context) {
    const variant = baseVariant(context, 87, this.supportedModifiers);
    const curious = isHighTrait(context, "curiosidad");
    const correct = curious ? "aceptar" : "defender";
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "choice",
        options: [
          { id: "defender", label: "Defenderme" },
          { id: "aceptar", label: "Aceptar la acusación" },
        ],
        correctChoice: correct,
      },
    };
  },
  validate(submission, context, variant) {
    const payload = submission.payload as { choice?: string };
    const curious = isHighTrait(context, "curiosidad");
    const correct = curious ? "aceptar" : "defender";
    if (payload.choice === correct) return { success: true };
    return { success: false, message: "El juicio no se satisface." };
  },
  hints: [
    { id: 1, text: "Si fuiste curioso, acepta." },
    { id: 2, text: "Si no, defiéndete." },
    { id: 3, text: "La honestidad ante el juicio." },
  ],
});

export const level88: LevelDefinition = levelDef({
  id: 88,
  title: "La pregunta final",
  act: 9,
  archetypeTags: ["judgment", "personality", "question"],
  mechanic: "final_question",
  narrativeEntry: "¿Cuál es tu arquetipo dominante?",
  supportedModifiers: ["reward_honesty", "favor_logic", "favor_intuition"],
  generateVariant(context) {
    const variant = baseVariant(context, 88, this.supportedModifiers);
    const archetype = context.personality?.primaryArchetype ?? "El Observador";
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "text",
        acceptedAnswers: [archetype, archetype.toLowerCase()],
      },
    };
  },
  validate(submission, context, variant) {
    const payload = submission.payload as { answer?: string };
    const archetype = context.personality?.primaryArchetype ?? "";
    const accepted = variant.params.acceptedAnswers as string[];
    if (payload.answer && matchesAnyVariant(payload.answer, [archetype, ...accepted])) {
      return { success: true };
    }
    return { success: false, message: "Ese no es tu arquetipo." };
  },
  hints: [
    { id: 1, text: "Resultado de la prueba inicial." },
    { id: 2, text: "El Observador, El Tramposo, etc." },
    { id: 3, text: "Tu primaryArchetype." },
  ],
});

export const level89: LevelDefinition = levelDef({
  id: 89,
  title: "Aceptar las consecuencias",
  act: 9,
  archetypeTags: ["judgment", "acceptance", "consequence"],
  mechanic: "accept_consequences",
  narrativeEntry: "Cien umbrales. ¿Aceptas lo que construiste?",
  supportedModifiers: ["reward_honesty", "accept_incompleteness", "reduce_control"],
  generateVariant(context) {
    const variant = baseVariant(context, 89, this.supportedModifiers);
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "text",
        acceptedAnswers: ["acepto", "si", "sí", "yes", "accept"],
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { answer?: string; accept?: boolean };
    const accepted = variant.params.acceptedAnswers as string[];
    if (payload.accept) return { success: true };
    if (payload.answer && matchesAnyVariant(payload.answer, accepted)) return { success: true };
    return { success: false, message: "El juicio espera aceptación." };
  },
  hints: [
    { id: 1, text: "No hay apelación." },
    { id: 2, text: "Acepta lo construido." },
    { id: 3, text: "Escribe «acepto»." },
  ],
});

export const level90: LevelDefinition = levelDef({
  id: 90,
  title: "El veredicto",
  act: 9,
  archetypeTags: ["judgment", "verdict", "tarot"],
  mechanic: "verdict",
  narrativeEntry: "El Juicio (arcano XX) habla. Nombra la carta.",
  supportedModifiers: ["favor_logic", "favor_intuition", "accept_incompleteness"],
  generateVariant(context) {
    const variant = baseVariant(context, 90, this.supportedModifiers);
    const juicio = MAJOR_ARCANA[20];
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "text",
        acceptedAnswers: [juicio.name, "Juicio", "juicio", "El Juicio", "XX", "20"],
        correctCardId: juicio.id,
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { answer?: string; cardId?: number };
    const accepted = variant.params.acceptedAnswers as string[];
    if (payload.cardId === 20) return { success: true };
    if (payload.answer && matchesAnyVariant(payload.answer, accepted)) {
      return { success: true, consequences: [{ key: "judgment_complete", value: true }] };
    }
    return { success: false, message: "El veredicto no resuena." };
  },
  hints: [
    { id: 1, text: "Arcano XX." },
    { id: 2, text: "Renacimiento y llamada final." },
    { id: 3, text: "El Juicio." },
  ],
});

export const ACT9_LEVELS = [
  level81, level82, level83, level84, level85,
  level86, level87, level88, level89, level90,
];
