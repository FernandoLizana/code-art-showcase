import { matchesAnyVariant } from "@/lib/game/normalize";
import { seedToIndex } from "@/lib/security/hash";
import { baseVariant, levelDef } from "./base";
import type { LevelDefinition } from "@/types/game";

const BALANCE_PAIRS: Record<string, [string, string]> = {
  dominancia: ["orden", "escucha"],
  sumision: ["obediencia", "iniciativa"],
  bondad: ["bondad", "limite"],
  impulsividad: ["accion", "silencio"],
  paciencia: ["espera", "decision"],
  pensamiento_logico: ["logica", "intuicion"],
  pensamiento_intuitivo: ["intuicion", "precision"],
  curiosidad: ["curiosidad", "contencion"],
  perfeccionismo: ["perfeccion", "imperfeccion"],
  default: ["luz", "sombra"],
};

export const level06: LevelDefinition = levelDef({
  id: 6,
  title: "La balanza",
  act: 1,
  archetypeTags: ["balance", "personality"],
  mechanic: "balance",
  narrativeEntry: "Dos recipientes. Palabras, no pesos. El equilibrio no es simetría.",
  supportedModifiers: ["require_boundaries", "reward_honesty", "reduce_control"],
  generateVariant(context) {
    const variant = baseVariant(context, 6, this.supportedModifiers);
    const dim = context.personality?.dominantDimension ?? "default";
    const pair = BALANCE_PAIRS[dim] ?? BALANCE_PAIRS.default;
    const levelSeed = variant.params.levelSeed as string;
    const targetLeft = seedToIndex(`${levelSeed}:left`, 5) + 3;
    const targetRight = targetLeft;
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "balance",
        leftLabel: pair[0],
        rightLabel: pair[1],
        leftItems: ["control", "certeza", "prisa", "ego"],
        rightItems: ["escucha", "duda", "calma", "otro"],
        targetLeft,
        targetRight,
        validPairs: [pair],
      },
    };
  },
  validate(submission, context, variant) {
    const payload = submission.payload as { left?: string[]; right?: string[] };
    const left = payload.left ?? [];
    const right = payload.right ?? [];
    if (left.length !== right.length) {
      return { success: false, message: "Los recipientes no están equilibrados." };
    }
    const dim = context.personality?.dominantDimension ?? "default";
    const pair = BALANCE_PAIRS[dim] ?? BALANCE_PAIRS.default;
    const hasOpposites =
      left.some((w) => pair.includes(w) || ["control", "certeza", "prisa", "ego"].includes(w)) &&
      right.some((w) => pair.includes(w) || ["escucha", "duda", "calma", "otro"].includes(w));
    if (left.length >= 2 && right.length >= 2 && hasOpposites) {
      return { success: true };
    }
    return { success: false, message: "Las palabras no se reconocen entre sí." };
  },
  hints: [
    { id: 1, text: "No busques peso. Busca oposición que se sostenga." },
    { id: 2, text: "Tu tendencia dominante revela qué conceptos debes equilibrar." },
    { id: 3, text: "Coloca en cada recipiente lo que contradice tu hábito." },
  ],
});

export const level07: LevelDefinition = levelDef({
  id: 7,
  title: "El nombre prestado",
  act: 1,
  archetypeTags: ["memory", "name"],
  mechanic: "reverse_name",
  narrativeEntry: "Te dieron un nombre que no es tuyo. Apareció un instante. Desapareció.",
  supportedModifiers: ["favor_logic", "require_patience", "accept_incompleteness"],
  generateVariant(context) {
    const variant = baseVariant(context, 7, this.supportedModifiers);
    const name = context.personality?.borrowedName ?? "Mara Vex";
    const reversed = name.split("").reverse().join("");
    const pattern = derivePattern(name);
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "pattern_name",
        displayName: name,
        showDurationMs: variant.modifier === "require_patience" ? 2000 : 4000,
        pattern,
        reversedName: reversed,
      },
    };
  },
  validate(submission, context, variant) {
    const payload = submission.payload as { answer?: string };
    const name = context.personality?.borrowedName ?? "";
    const reversed = variant.params.reversedName as string;
    const accepted = [reversed, reversed.toLowerCase(), name.split("").reverse().join("")];
    if (payload.answer && matchesAnyVariant(payload.answer.replace(/\s/g, ""), accepted)) {
      return {
        success: true,
        consequences: [
          { key: "borrowed_name", value: name },
          { key: "words", value: name },
        ],
      };
    }
    return { success: false, message: "El nombre no responde al espejo." };
  },
  hints: [
    { id: 1, text: "El archivo te prestó un nombre al inicio." },
    { id: 2, text: "Un patrón breve mostró cómo invertir las letras." },
    { id: 3, text: "Escribe el nombre prestado al revés, sin espacios." },
  ],
});

function derivePattern(name: string): string {
  return name
    .split("")
    .map((c, i) => (i % 2 === 0 ? c.toUpperCase() : c.toLowerCase()))
    .join("");
}

export const level08: LevelDefinition = levelDef({
  id: 8,
  title: "La vela",
  act: 1,
  archetypeTags: ["patience", "wait"],
  mechanic: "wait",
  narrativeEntry: "Una llama solitaria. Cada gesto la apaga un poco más.",
  supportedModifiers: ["require_patience", "resist_curiosity", "require_quick_action"],
  generateVariant(context) {
    const variant = baseVariant(context, 8, this.supportedModifiers);
    const levelSeed = variant.params.levelSeed as string;
    const baseDuration = 12000 + seedToIndex(`${levelSeed}:wait`, 19) * 1000;
    const durationMs = Math.max(12000, Math.min(30000, baseDuration));
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "wait",
        durationMs,
        minWaitMs: durationMs - 500,
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { waitedMs?: number; clickCount?: number };
    const durationMs = variant.params.durationMs as number;
    const minWait = (variant.params.minWaitMs as number) ?? durationMs - 1000;
    if ((payload.clickCount ?? 0) > 0) {
      return { success: false, message: "Cada toque apaga la llama." };
    }
    if ((payload.waitedMs ?? 0) >= minWait) {
      return { success: true };
    }
    return { success: false, message: "La llama aún no ha aprendido a confiar." };
  },
  hints: [
    { id: 1, text: "La vela se consume con la impaciencia." },
    { id: 2, text: "No hagas nada. Eso también es una respuesta." },
    { id: 3, text: "Espera hasta que la habitación deje de pedirte acción." },
  ],
});

export const level09: LevelDefinition = levelDef({
  id: 9,
  title: "El número incorrecto",
  act: 1,
  archetypeTags: ["numerology", "logic"],
  mechanic: "sequence_break",
  narrativeEntry: "Una secuencia progresa. Todos buscan el siguiente. El error ya ocurrió.",
  supportedModifiers: ["favor_logic", "favor_intuition", "accept_incompleteness"],
  generateVariant(context) {
    const variant = baseVariant(context, 9, this.supportedModifiers);
    const levelSeed = variant.params.levelSeed as string;
    const start = 2 + seedToIndex(`${levelSeed}:start`, 5);
    const sequence: number[] = [];
    for (let i = 0; i < 6; i++) {
      sequence.push(start + i * (i + 1));
    }
    const wrongIndex = 2 + seedToIndex(`${levelSeed}:wrong`, 3);
    sequence[wrongIndex] = sequence[wrongIndex] + seedToIndex(`${levelSeed}:off`, 5) + 2;
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "sequence_break",
        sequence,
        wrongIndex,
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { selectedIndex?: number; selectedValue?: number };
    const wrongIndex = variant.params.wrongIndex as number;
    const sequence = variant.params.sequence as number[];
    if (payload.selectedIndex === wrongIndex) return { success: true };
    if (
      payload.selectedValue !== undefined &&
      sequence[wrongIndex] === payload.selectedValue
    ) {
      return { success: true };
    }
    return { success: false, message: "Ese número obedece la regla." };
  },
  hints: [
    { id: 1, text: "No busques el siguiente. Busca el que rompió el patrón." },
    { id: 2, text: "La diferencia entre términos no es constante." },
    { id: 3, text: "Uno de los números visibles ya traicionó la secuencia." },
  ],
});

export const level10: LevelDefinition = levelDef({
  id: 10,
  title: "El primer umbral",
  act: 1,
  archetypeTags: ["choice", "tarot", "consequence"],
  mechanic: "card_choice",
  narrativeEntry: "Tres cartas. Ninguna miente. Ninguna es universalmente correcta.",
  supportedModifiers: ["reduce_control", "require_initiative", "favor_intuition"],
  generateVariant(context) {
    const variant = baseVariant(context, 10, this.supportedModifiers);
    const cards = [
      { id: "silencio", name: "El Silencio", desc: "Observar sin intervenir" },
      { id: "filo", name: "El Filo", desc: "Cortar lo innecesario" },
      { id: "raiz", name: "La Raíz", desc: "Hundirse antes de ascender" },
    ];
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "card_choice",
        cards,
        correctChoice: null,
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { choice?: string };
    const cards = (variant.params.cards as { id: string }[]) ?? [];
    const validIds = cards.map((c) => c.id);
    if (payload.choice && validIds.includes(payload.choice)) {
      return {
        success: true,
        consequences: [
          { key: "threshold_choice", value: payload.choice },
          { key: "entityState", value: { thresholdCard: payload.choice } },
        ],
      };
    }
    return { success: false, message: "Debes elegir una carta." };
  },
  hints: [
    { id: 1, text: "No hay respuesta incorrecta. Hay consecuencias." },
    { id: 2, text: "Elige según lo que estés dispuesto a convertir en camino." },
    { id: 3, text: "Cualquier carta abre el Acto II. Ninguna cierra el archivo." },
  ],
});

export const ACT1_LEVELS_EXTRA = [level06, level07, level08, level09, level10];
