import { matchesAnyVariant } from "@/lib/game/normalize";
import { MAJOR_ARCANA } from "@/lib/tarot/constants";
import { seedToIndex } from "@/lib/security/hash";
import { deriveSequenceFromSeed } from "@/lib/security/seed";
import { baseVariant, isHighTrait, levelDef } from "./base";
import type { LevelDefinition } from "@/types/game";

const MAGO_ELEMENTS = ["fuego", "agua", "aire", "tierra"] as const;
const WHEEL_SYMBOLS = ["☉", "☽", "△", "▽", "○", "□", "✦", "✧"];

export const level21: LevelDefinition = levelDef({
  id: 21,
  title: "El Loco retrocede",
  act: 3,
  archetypeTags: ["tarot", "loco", "direction"],
  mechanic: "fool_walk",
  narrativeEntry: "Una figura avanza cuando tú retrocedes. El camino obedece al espejo.",
  supportedModifiers: ["favor_intuition", "favor_logic", "require_patience"],
  generateVariant(context) {
    const variant = baseVariant(context, 21, this.supportedModifiers);
    const levelSeed = variant.params.levelSeed as string;
    const steps = 5 + seedToIndex(`${levelSeed}:steps`, 4);
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "fool_walk",
        steps,
        correctDirection: "backward",
        instruction: "Mueve el cursor hacia adelante. Observa hacia dónde camina el Loco.",
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { direction?: string; stepsCompleted?: number };
    const correct = variant.params.correctDirection as string;
    const steps = variant.params.steps as number;
    if (payload.direction === correct || payload.direction === "atras" || payload.direction === "atrás") {
      if ((payload.stepsCompleted ?? steps) >= steps) return { success: true };
    }
    return { success: false, message: "El Loco no reconoce ese camino." };
  },
  hints: [
    { id: 1, text: "Tu cursor y el Loco no comparten la misma orientación." },
    { id: 2, text: "Cuando avanzas, él retrocede. Reporta su dirección, no la tuya." },
    { id: 3, text: "La respuesta es «atrás» o «backward»." },
  ],
});

export const level22: LevelDefinition = levelDef({
  id: 22,
  title: "Los tres pilares",
  act: 3,
  archetypeTags: ["tarot", "sacerdotisa", "order"],
  mechanic: "pillar_order",
  narrativeEntry: "Tres pilares: II, B, J. Ordénalos despacio. La prisa los confunde.",
  supportedModifiers: ["require_patience", "favor_logic", "favor_intuition"],
  generateVariant(context) {
    const variant = baseVariant(context, 22, this.supportedModifiers);
    const levelSeed = variant.params.levelSeed as string;
    const reversed = seedToIndex(`${levelSeed}:order`, 2) === 1;
    const acceptedAnswers = reversed ? ["JBO", "jbo"] : ["BOJ", "boj"];
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "text",
        symbols: ["II", "B", "J"],
        paceMs: variant.modifier === "require_patience" ? 2000 : 1200,
        acceptedAnswers,
        placeholder: "Orden de izquierda a derecha...",
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { answer?: string };
    const accepted = variant.params.acceptedAnswers as string[];
    if (payload.answer && matchesAnyVariant(payload.answer.replace(/\s/g, ""), accepted)) {
      return { success: true };
    }
    return { success: false, message: "Los pilares no responden a ese orden." };
  },
  hints: [
    { id: 1, text: "Observa el orden en que aparecen II, B y J." },
    { id: 2, text: "Escribe las letras sin espacios, de izquierda a derecha." },
    { id: 3, text: "BOJ o JBO, según cómo se alinearon los pilares." },
  ],
});

export const level23: LevelDefinition = levelDef({
  id: 23,
  title: "La mesa del Mago",
  act: 3,
  archetypeTags: ["tarot", "mago", "elements"],
  mechanic: "missing_element",
  narrativeEntry: "Cuatro elementos sobre la mesa. Uno fue sustraído antes de que llegaras.",
  supportedModifiers: ["favor_logic", "favor_intuition", "accept_incompleteness"],
  generateVariant(context) {
    const variant = baseVariant(context, 23, this.supportedModifiers);
    const levelSeed = variant.params.levelSeed as string;
    const missingIdx = seedToIndex(`${levelSeed}:missing`, MAGO_ELEMENTS.length);
    const missing = MAGO_ELEMENTS[missingIdx];
    const present = MAGO_ELEMENTS.filter((_, i) => i !== missingIdx);
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "choice",
        options: MAGO_ELEMENTS.map((e) => ({ id: e, label: e.charAt(0).toUpperCase() + e.slice(1) })),
        presentElements: present,
        correctChoice: missing,
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { choice?: string };
    if (payload.choice === variant.params.correctChoice) return { success: true };
    return { success: false, message: "Ese elemento aún está sobre la mesa." };
  },
  hints: [
    { id: 1, text: "El Mago trabaja con fuego, agua, aire y tierra." },
    { id: 2, text: "Tres elementos son visibles. Uno falta." },
    { id: 3, text: "Elige el que no aparece entre los presentes." },
  ],
});

export const level24: LevelDefinition = levelDef({
  id: 24,
  title: "Entre dos caminos",
  act: 3,
  archetypeTags: ["tarot", "enamorados", "choice"],
  mechanic: "between_choice",
  narrativeEntry: "Dos opciones brillan. La respuesta no es ninguna. Es lo que las separa.",
  supportedModifiers: ["favor_intuition", "accept_incompleteness", "reduce_control"],
  generateVariant(context) {
    const variant = baseVariant(context, 24, this.supportedModifiers);
    const levelSeed = variant.params.levelSeed as string;
    const pairIdx = seedToIndex(`${levelSeed}:pair`, 3);
    const pairs = [
      { left: "Sí", right: "No", between: "entre" },
      { left: "Luz", right: "Sombra", between: "umbral" },
      { left: "Amor", right: "Deber", between: "eleccion" },
    ];
    const pair = pairs[pairIdx];
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "between_choice",
        leftOption: pair.left,
        rightOption: pair.right,
        correctChoice: pair.between,
        acceptedAnswers: [pair.between, "entre", "umbral", "eleccion", "elección", "espacio", "vacío", "vacio"],
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { choice?: string; answer?: string };
    const accepted = variant.params.acceptedAnswers as string[];
    const correct = variant.params.correctChoice as string;
    if (payload.choice === "between" || payload.choice === correct) return { success: true };
    if (payload.answer && matchesAnyVariant(payload.answer, accepted)) return { success: true };
    return { success: false, message: "Ni uno ni otro. Algo más." };
  },
  hints: [
    { id: 1, text: "No elijas un lado. Elige lo que no es opción." },
    { id: 2, text: "Busca el espacio, el umbral, la elección misma." },
    { id: 3, text: "Selecciona la zona entre las dos respuestas." },
  ],
});

export const level25: LevelDefinition = levelDef({
  id: 25,
  title: "La balanza del arcano",
  act: 3,
  archetypeTags: ["tarot", "justicia", "balance"],
  mechanic: "balance_forces",
  narrativeEntry: "Dos fuerzas en tensión. Ni victoria ni rendición. Equilibrio.",
  supportedModifiers: ["require_boundaries", "reduce_control", "reward_honesty"],
  generateVariant(context) {
    const variant = baseVariant(context, 25, this.supportedModifiers);
    const levelSeed = variant.params.levelSeed as string;
    const forcePairs = [
      ["acción", "contemplación"],
      ["fuerza", "compasión"],
      ["control", "soltar"],
    ];
    const pair = forcePairs[seedToIndex(`${levelSeed}:forces`, forcePairs.length)];
    const target = 4 + seedToIndex(`${levelSeed}:target`, 3);
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "balance_forces",
        leftForce: pair[0],
        rightForce: pair[1],
        leftItems: ["impulso", "rigor", "certeza", "prisa"],
        rightItems: ["calma", "duda", "paciencia", "escucha"],
        targetLeft: target,
        targetRight: target,
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { left?: string[]; right?: string[]; balanced?: boolean };
    const target = variant.params.targetLeft as number;
    const left = payload.left ?? [];
    const right = payload.right ?? [];
    if (payload.balanced || (left.length === target && right.length === target)) {
      return { success: true };
    }
    return { success: false, message: "Las fuerzas aún no se reconocen." };
  },
  hints: [
    { id: 1, text: "Distribuye conceptos opuestos en igual cantidad." },
    { id: 2, text: "Ni todo a un lado ni vacío al otro." },
    { id: 3, text: "Equilibra cuatro elementos en cada bando." },
  ],
});

export const level26: LevelDefinition = levelDef({
  id: 26,
  title: "El toque leve",
  act: 3,
  archetypeTags: ["tarot", "fuerza", "patience"],
  mechanic: "gentle_touch",
  narrativeEntry: "Una criatura frágil. La fuerza la destruye. La paciencia la abre.",
  supportedModifiers: ["require_patience", "require_quick_action", "reduce_control"],
  generateVariant(context) {
    const variant = baseVariant(context, 26, this.supportedModifiers);
    const levelSeed = variant.params.levelSeed as string;
    const minDurationMs = variant.modifier === "require_quick_action" ? 3000 : 6000;
    const maxPressure = variant.modifier === "require_patience" ? 0.2 : 0.35;
    const targetProgress = 0.85 + seedToIndex(`${levelSeed}:prog`, 10) * 0.01;
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "gentle_touch",
        minDurationMs,
        maxPressure,
        targetProgress,
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as {
      durationMs?: number;
      maxPressure?: number;
      progress?: number;
      gentle?: boolean;
    };
    const minDuration = variant.params.minDurationMs as number;
    const maxPressure = variant.params.maxPressure as number;
    const targetProgress = variant.params.targetProgress as number;
    if (payload.gentle) return { success: true };
    if (
      (payload.durationMs ?? 0) >= minDuration &&
      (payload.maxPressure ?? 1) <= maxPressure &&
      (payload.progress ?? 0) >= targetProgress
    ) {
      return { success: true };
    }
    return { success: false, message: "Demasiado prisa. Demasiada fuerza." };
  },
  hints: [
    { id: 1, text: "Mantén la presión por debajo del umbral." },
    { id: 2, text: "Tómate tu tiempo. La criatura no huye." },
    { id: 3, text: "Interacción lenta y suave hasta completar el círculo." },
  ],
});

export const level27: LevelDefinition = levelDef({
  id: 27,
  title: "El círculo de la lámpara",
  act: 3,
  archetypeTags: ["tarot", "ermitano", "reveal"],
  mechanic: "lamp_circle",
  narrativeEntry: "Una lámpara solitaria. Solo el círculo de luz enseña lo oculto.",
  supportedModifiers: ["favor_intuition", "require_patience", "favor_logic"],
  generateVariant(context) {
    const variant = baseVariant(context, 27, this.supportedModifiers);
    const levelSeed = variant.params.levelSeed as string;
    const answers = ["La Estrella", "El Ermitaño", "La Luna", "El Sol"];
    const answer = answers[seedToIndex(`${levelSeed}:answer`, answers.length)];
    const acceptedAnswers = [answer, answer.replace(/^La? /, ""), "estrella", "ermitano", "luna", "sol"];
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "lamp",
        hiddenText: answer,
        circleRadius: 80,
        acceptedAnswers,
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { answer?: string };
    const accepted = variant.params.acceptedAnswers as string[];
    if (payload.answer && matchesAnyVariant(payload.answer, accepted)) return { success: true };
    return { success: false, message: "La luz no reconoce eso." };
  },
  hints: [
    { id: 1, text: "Arrastra el círculo de luz sobre la oscuridad." },
    { id: 2, text: "Lee lo que solo aparece bajo la lámpara." },
    { id: 3, text: "Un arcano mayor se esconde en el halo." },
  ],
});

export const level28: LevelDefinition = levelDef({
  id: 28,
  title: "La rueda detenida",
  act: 3,
  archetypeTags: ["tarot", "rueda", "frequency"],
  mechanic: "wheel_stop",
  narrativeEntry: "La rueda gira. Deténla donde menos abunda.",
  supportedModifiers: ["favor_logic", "favor_intuition", "require_patience"],
  generateVariant(context) {
    const variant = baseVariant(context, 28, this.supportedModifiers);
    const levelSeed = variant.params.levelSeed as string;
    const symbols = deriveSequenceFromSeed(`${levelSeed}:wheel`, 12, WHEEL_SYMBOLS);
    const counts: Record<string, number> = {};
    for (const s of symbols) counts[s] = (counts[s] ?? 0) + 1;
    let leastSymbol = symbols[0];
    let leastCount = Infinity;
    for (const [sym, count] of Object.entries(counts)) {
      if (count < leastCount) {
        leastCount = count;
        leastSymbol = sym;
      }
    }
    const leastIndex = symbols.lastIndexOf(leastSymbol);
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "wheel",
        symbols,
        correctIndex: leastIndex,
        correctSymbol: leastSymbol,
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { index?: number; symbol?: string };
    const correctIndex = variant.params.correctIndex as number;
    const correctSymbol = variant.params.correctSymbol as string;
    if (payload.index === correctIndex) return { success: true };
    if (payload.symbol === correctSymbol) return { success: true };
    return { success: false, message: "Ese símbolo aparece demasiado." };
  },
  hints: [
    { id: 1, text: "Cuenta cuántas veces aparece cada símbolo." },
    { id: 2, text: "Detén la rueda en el más raro." },
    { id: 3, text: "El menos frecuente abre el umbral." },
  ],
});

export const level29: LevelDefinition = levelDef({
  id: 29,
  title: "Los testimonios",
  act: 3,
  archetypeTags: ["tarot", "juicio", "memory"],
  mechanic: "testimonies",
  narrativeEntry: "Tres voces. Cada una recuerda un orden distinto. Reconstruye la verdad.",
  supportedModifiers: ["favor_logic", "favor_intuition", "accept_incompleteness"],
  generateVariant(context) {
    const variant = baseVariant(context, 29, this.supportedModifiers);
    const levelSeed = variant.params.levelSeed as string;
    const pool = MAJOR_ARCANA.slice(0, 5);
    const shuffled = [...pool].sort(
      (a, b) =>
        seedToIndex(`${levelSeed}:${a.id}`, 100) - seedToIndex(`${levelSeed}:${b.id}`, 100),
    );
    const expectedOrder = shuffled.map((c) => c.id);
    const testimonies = [
      { speaker: "Primera voz", order: [...expectedOrder].reverse() },
      { speaker: "Segunda voz", order: [expectedOrder[2], expectedOrder[0], expectedOrder[4], expectedOrder[1], expectedOrder[3]] },
      { speaker: "Tercera voz", order: expectedOrder.map((id, i) => expectedOrder[(i + 1) % expectedOrder.length]) },
    ];
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "testimonies",
        cards: pool.map((c) => ({ id: c.id, name: c.name })),
        testimonies,
        expectedOrder,
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { order?: number[] };
    const expected = variant.params.expectedOrder as number[];
    if (payload.order && JSON.stringify(payload.order) === JSON.stringify(expected)) {
      return { success: true };
    }
    return { success: false, message: "Los testimonios no concuerdan con tu orden." };
  },
  hints: [
    { id: 1, text: "Ningún testimonio es completamente fiable." },
    { id: 2, text: "Busca qué posición repiten dos voces." },
    { id: 3, text: "Reconstruye el orden original de los cinco arcanos." },
  ],
});

export const level30: LevelDefinition = levelDef({
  id: 30,
  title: "El texto invertido",
  act: 3,
  archetypeTags: ["tarot", "mundo", "inversion"],
  mechanic: "inverted_text",
  narrativeEntry: "Todo está al revés. Incluso las instrucciones. Especialmente las instrucciones.",
  supportedModifiers: ["favor_intuition", "accept_incompleteness", "favor_logic"],
  generateVariant(context) {
    const variant = baseVariant(context, 30, this.supportedModifiers);
    const levelSeed = variant.params.levelSeed as string;
    const phrases = ["completa el ciclo", "cierra el arco", "termina el mazo"];
    const phrase = phrases[seedToIndex(`${levelSeed}:phrase`, phrases.length)];
    const inverted = phrase.split("").reverse().join("");
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "inverted_text",
        displayText: inverted,
        acceptedAnswers: [phrase, ...phrase.split(" ")],
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { answer?: string };
    const accepted = variant.params.acceptedAnswers as string[];
    if (payload.answer && matchesAnyVariant(payload.answer, accepted)) return { success: true };
    return { success: false, message: "Leer al derecho no basta." };
  },
  hints: [
    { id: 1, text: "Voltea mentalmente cada letra." },
    { id: 2, text: "La frase habla de cerrar algo." },
    { id: 3, text: "«Completa el ciclo» o similar." },
  ],
});

export const ACT3_LEVELS = [
  level21, level22, level23, level24, level25,
  level26, level27, level28, level29, level30,
];
