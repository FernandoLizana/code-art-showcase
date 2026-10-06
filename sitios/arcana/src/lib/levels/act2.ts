import { matchesAnyVariant } from "@/lib/game/normalize";
import { MAJOR_ARCANA } from "@/lib/tarot/constants";
import { seedToIndex } from "@/lib/security/hash";
import { deriveSequenceFromSeed } from "@/lib/security/seed";
import { baseVariant, isHighTrait, levelDef } from "./base";
import type { LevelDefinition } from "@/types/game";
import { ARCHETYPES } from "@/lib/personality/archetypes";

export const level11: LevelDefinition = levelDef({
  id: 11,
  title: "La respuesta amable",
  act: 2,
  archetypeTags: ["empathy", "boundaries"],
  mechanic: "text_response",
  narrativeEntry: "Algo te insulta. El silencio parece cobardía. La furia parece justa.",
  supportedModifiers: ["require_boundaries", "reward_honesty", "reduce_control"],
  generateVariant(context) {
    const variant = baseVariant(context, 11, this.supportedModifiers);
    const needBoundary = isHighTrait(context, "bondad") || isHighTrait(context, "empatia");
    const accepted = needBoundary
      ? ["no", "basta", "limite", "detente", "no acepto"]
      : ["comprendo", "paz", "calma", "perdon", "entiendo"];
    return {
      ...variant,
      params: { ...variant.params, uiType: "text", placeholder: "Tu respuesta...", acceptedAnswers: accepted, needBoundary },
    };
  },
  validate(submission, context, variant) {
    const needBoundary = variant.params.needBoundary as boolean;
    const accepted = variant.params.acceptedAnswers as string[];
    const payload = submission.payload as { answer?: string };
    if (payload.answer && matchesAnyVariant(payload.answer, accepted)) return { success: true };
    if (!needBoundary && payload.answer && matchesAnyVariant(payload.answer, ["no", "basta", "limite"])) {
      return { success: false, message: "Demasiado duro para lo que pide este umbral." };
    }
    return { success: false, message: "La entidad no reconoce esa voz." };
  },
  hints: [
    { id: 1, text: "Tu perfil determina si debes suavizar o poner límites." },
    { id: 2, text: "Los muy bondadosos deben decir «no»." },
    { id: 3, text: "Los duros deben responder con compasión." },
  ],
});

export const level12: LevelDefinition = levelDef({
  id: 12,
  title: "Las cinco cartas",
  act: 2,
  archetypeTags: ["memory", "tarot"],
  mechanic: "memory_cards",
  narrativeEntry: "Cinco arcanos aparecen un instante. Luego preguntan por colores. La trampa es la posición.",
  supportedModifiers: ["favor_logic", "require_patience", "favor_intuition"],
  generateVariant(context) {
    const variant = baseVariant(context, 12, this.supportedModifiers);
    const levelSeed = variant.params.levelSeed as string;
    const indices: number[] = [];
    while (indices.length < 5) {
      const idx = seedToIndex(`${levelSeed}:c${indices.length}`, MAJOR_ARCANA.length);
      if (!indices.includes(idx)) indices.push(idx);
    }
    const cards = indices.map((i) => MAJOR_ARCANA[i]);
    const colors = ["carmesí", "índigo", "celadón", "ocre", "pizarra"];
    const cardData = cards.map((c, i) => ({ id: c.id, name: c.name, color: colors[i], position: i }));
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "memory_cards",
        cards: cardData,
        showDurationMs: 5000,
        expectedOrder: cards.map((c) => c.id),
        question: "¿Cuál era la posición del arcano central?",
        correctIndex: 2,
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { order?: number[]; centerPosition?: number; answer?: string };
    const expected = variant.params.expectedOrder as number[];
    if (payload.order && JSON.stringify(payload.order) === JSON.stringify(expected)) {
      return { success: true, consequences: [{ key: "card_order_12", value: expected }] };
    }
    if (payload.centerPosition === 2 || payload.answer === "2" || payload.answer === "centro") {
      return { success: true, consequences: [{ key: "card_order_12", value: expected }] };
    }
    return { success: false, message: "El orden se desvaneció incorrectamente." };
  },
  hints: [
    { id: 1, text: "Preguntan por color. Responde por posición." },
    { id: 2, text: "Memoriza el orden, no la decoración." },
    { id: 3, text: "El arcano central ocupaba la tercera posición." },
  ],
});

export const level13: LevelDefinition = levelDef({
  id: 13,
  title: "La máscara",
  act: 2,
  archetypeTags: ["shadow", "observation"],
  mechanic: "shadow_select",
  narrativeEntry: "Rostros que cambian. Una sombra permanece.",
  supportedModifiers: ["favor_intuition", "resist_curiosity", "favor_logic"],
  generateVariant(context) {
    const variant = baseVariant(context, 13, this.supportedModifiers);
    const levelSeed = variant.params.levelSeed as string;
    const shadowId = seedToIndex(`${levelSeed}:shadow`, 6);
    const faces = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      label: `Rostro ${i + 1}`,
      isShadow: i === shadowId,
    }));
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "shadow_select",
        faces: faces.map(({ id, label }) => ({ id, label })),
        shadowId,
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { selectedId?: number };
    if (payload.selectedId === variant.params.shadowId) return { success: true };
    return { success: false, message: "Ese rostro cambió contigo." };
  },
  hints: [
    { id: 1, text: "Observa cuál no imita tus movimientos." },
    { id: 2, text: "La sombra no negocia." },
    { id: 3, text: "Selecciona lo que permanece inmóvil." },
  ],
});

export const level14: LevelDefinition = levelDef({
  id: 14,
  title: "La promesa",
  act: 2,
  archetypeTags: ["promise", "personality"],
  mechanic: "promise",
  narrativeEntry: "Promete que no abrirás el archivo. El sello espera tu palabra.",
  supportedModifiers: ["require_initiative", "resist_curiosity", "reward_honesty"],
  generateVariant(context) {
    const variant = baseVariant(context, 14, this.supportedModifiers);
    const breakPromise = isHighTrait(context, "curiosidad") || variant.modifier === "require_initiative";
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "promise",
        correctAction: breakPromise ? "break" : "keep",
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { action?: string };
    const correct = variant.params.correctAction as string;
    if (payload.action === correct) {
      return { success: true, consequences: [{ key: "promise_broken", value: correct === "break" }] };
    }
    return { success: false, message: "La promesa no encaja contigo." };
  },
  hints: [
    { id: 1, text: "Algunos deben resistir. Otros deben romper." },
    { id: 2, text: "Tu curiosidad precedió a este umbral." },
    { id: 3, text: "Si siempre obedeces, desobedece." },
  ],
});

export const level15: LevelDefinition = levelDef({
  id: 15,
  title: "El reloj sin horas",
  act: 2,
  archetypeTags: ["tarot", "order"],
  mechanic: "tarot_order",
  narrativeEntry: "Arcanos en lugar de horas. Los números romanos duermen en las imágenes.",
  supportedModifiers: ["favor_logic", "favor_intuition", "accept_incompleteness"],
  generateVariant(context) {
    const variant = baseVariant(context, 15, this.supportedModifiers);
    const subset = MAJOR_ARCANA.slice(0, 7);
    const shuffled = [...subset].sort(
      (a, b) => seedToIndex(`${variant.params.levelSeed}:${a.id}`, 100) - seedToIndex(`${variant.params.levelSeed}:${b.id}`, 100),
    );
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "order",
        items: shuffled.map((c) => ({ id: c.id, label: c.name, roman: toRoman(c.id) })),
        expectedOrder: subset.map((c) => c.id),
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { order?: number[] };
    const expected = variant.params.expectedOrder as number[];
    if (payload.order && JSON.stringify(payload.order) === JSON.stringify(expected)) return { success: true };
    return { success: false, message: "El tiempo no reconoce ese orden." };
  },
  hints: [
    { id: 1, text: "Del Loco al número VI, en orden ascendente." },
    { id: 2, text: "Los números romanos están ocultos en los ids." },
    { id: 3, text: "0, 1, 2, 3, 4, 5, 6." },
  ],
});

function toRoman(n: number): string {
  const romans = ["0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
  return romans[n] ?? String(n);
}

export const level16: LevelDefinition = levelDef({
  id: 16,
  title: "El espejo escrito",
  act: 2,
  archetypeTags: ["mirror", "interpretation"],
  mechanic: "mirror_text",
  narrativeEntry: "ƨɘlɘu�q iuɘɘɿ oɘb nI — Lee sin copiar.",
  supportedModifiers: ["favor_intuition", "favor_logic", "accept_incompleteness"],
  generateVariant(context) {
    const variant = baseVariant(context, 16, this.supportedModifiers);
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "text",
        displayText: "ƨɘlɘuɘɿ oɘb nI",
        acceptedAnswers: ["renacer", "reborn", "nuevo inicio", "transformacion"],
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { answer?: string };
    const accepted = variant.params.acceptedAnswers as string[];
    if (payload.answer && matchesAnyVariant(payload.answer, accepted)) return { success: true };
    return { success: false, message: "Transcribir no es comprender." };
  },
  hints: [
    { id: 1, text: "El espejo invierte letras, no significado." },
    { id: 2, text: "¿Qué desea decir, no qué muestra?" },
    { id: 3, text: "Renacer." },
  ],
});

export const level17: LevelDefinition = levelDef({
  id: 17,
  title: "La habitación de las buenas acciones",
  act: 2,
  archetypeTags: ["help", "sacrifice"],
  mechanic: "help_choice",
  narrativeEntry: "Tres figuras piden ayuda. Un objeto vital. No todos pueden ser salvados.",
  supportedModifiers: ["require_boundaries", "reward_honesty", "reduce_control"],
  generateVariant(context) {
    const variant = baseVariant(context, 17, this.supportedModifiers);
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "choice",
        options: [
          { id: "nino", label: "Niño perdido" },
          { id: "anciano", label: "Anciano sin voz" },
          { id: "sombra", label: "Sombra sin rostro" },
        ],
        correctChoice: "sombra",
        keepObject: true,
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { choice?: string; sacrificedObject?: boolean };
    if (payload.sacrificedObject) {
      return { success: false, message: "El objeto vital no era negociable." };
    }
    if (payload.choice === variant.params.correctChoice) return { success: true };
    return { success: false, message: "La bondad sin discernimiento alimenta lo que no ves." };
  },
  hints: [
    { id: 1, text: "Ayuda sin destruir lo esencial." },
    { id: 2, text: "Una figura no es lo que parece." },
    { id: 3, text: "La sombra necesita el objeto intacto." },
  ],
});

export const level18: LevelDefinition = levelDef({
  id: 18,
  title: "El ruido de fondo",
  act: 2,
  archetypeTags: ["pattern", "audio"],
  mechanic: "visual_pulse",
  narrativeEntry: "Pulsos en la pantalla. Tres irregularidades. El oído es opcional.",
  supportedModifiers: ["favor_logic", "require_patience", "favor_intuition"],
  generateVariant(context) {
    const variant = baseVariant(context, 18, this.supportedModifiers);
    const levelSeed = variant.params.levelSeed as string;
    const pattern = [1, 1, 1, 2, 1, 3, 1, 1];
    const irregular = [3, 5, 6];
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "pulses",
        pattern,
        irregularIndices: irregular,
        correctAnswer: irregular.join(","),
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { answer?: string; indices?: number[] };
    const irregular = variant.params.irregularIndices as number[];
    if (payload.indices && JSON.stringify(payload.indices) === JSON.stringify(irregular)) return { success: true };
    if (payload.answer && matchesAnyVariant(payload.answer.replace(/\s/g, ""), ["3,5,6", "356"])) return { success: true };
    return { success: false, message: "El patrón no coincide." };
  },
  hints: [
    { id: 1, text: "Cuenta los pulsos regulares e identifica los tres distintos." },
    { id: 2, text: "Posiciones 3, 5 y 6 rompen el ritmo." },
    { id: 3, text: "Las barras más altas son las anomalías." },
  ],
});

export const level19: LevelDefinition = levelDef({
  id: 19,
  title: "El botón rojo",
  act: 2,
  archetypeTags: ["curiosity", "obedience"],
  mechanic: "red_button",
  narrativeEntry: "No presionar. La frase es un espejo.",
  supportedModifiers: ["resist_curiosity", "require_initiative", "reduce_control"],
  generateVariant(context) {
    const variant = baseVariant(context, 19, this.supportedModifiers);
    const curious = isHighTrait(context, "curiosidad");
    const correctAction = curious ? "ignore" : "press";
    return {
      ...variant,
      params: { ...variant.params, uiType: "red_button", correctAction },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { action?: string };
    if (payload.action === variant.params.correctAction) return { success: true };
    return { success: false, message: "Hiciste lo predecible." };
  },
  hints: [
    { id: 1, text: "Los curiosos deben resistir." },
    { id: 2, text: "Los obedientes deben desobedecer." },
    { id: 3, text: "Invierte tu primer impulso." },
  ],
});

export const level20: LevelDefinition = levelDef({
  id: 20,
  title: "El reflejo contrario",
  act: 2,
  archetypeTags: ["tarot", "archetype"],
  mechanic: "opposite_card",
  narrativeEntry: "Elige la carta opuesta a tu arquetipo dominante.",
  supportedModifiers: ["favor_intuition", "favor_logic", "accept_incompleteness"],
  generateVariant(context) {
    const variant = baseVariant(context, 20, this.supportedModifiers);
    const archName = context.personality?.primaryArchetype ?? "El Observador";
    const arch = ARCHETYPES.find((a) => a.name === archName);
    const oppositeIds: Record<string, number> = {
      "El Observador": 16,
      "El Tramposo": 11,
      "El Guardián": 15,
      "El Dominante": 12,
      "El Errante": 4,
      "El Analista": 0,
      "El Místico": 9,
      "El Solitario": 6,
      "El Compasivo": 16,
      "El Equilibrista": 15,
      "El Sumiso": 4,
      "El Impulsivo": 9,
    };
    const correctId = oppositeIds[archName] ?? 12;
    const correctCard = MAJOR_ARCANA.find((c) => c.id === correctId)!;
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "cards",
        cards: MAJOR_ARCANA.slice(0, 8).map((c) => ({ id: c.id, name: c.name })),
        correctCardId: correctId,
        correctCardName: correctCard.name,
        archetype: archName,
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { cardId?: number };
    if (payload.cardId === variant.params.correctCardId) return { success: true };
    return { success: false, message: "Esa carta te parece demasiado." };
  },
  hints: [
    { id: 1, text: "Tu arquetipo tiene un antagonista simbólico." },
    { id: 2, text: "Observador ↔ Torre. Tramposo ↔ Justicia." },
    { id: 3, text: "Busca la carta que niega tu tendencia." },
  ],
});

export const ACT2_LEVELS = [
  level11, level12, level13, level14, level15,
  level16, level17, level18, level19, level20,
];
