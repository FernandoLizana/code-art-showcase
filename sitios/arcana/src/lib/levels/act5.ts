import { matchesAnyVariant } from "@/lib/game/normalize";
import { MAJOR_ARCANA } from "@/lib/tarot/constants";
import { seedToIndex } from "@/lib/security/hash";
import { baseVariant, levelDef } from "./base";
import type { LevelDefinition } from "@/types/game";

export const level41: LevelDefinition = levelDef({
  id: 41,
  title: "La respuesta rechazada",
  act: 5,
  archetypeTags: ["inversion", "error", "memory"],
  mechanic: "rejected_answer",
  narrativeEntry: "El archivo mintió. Una respuesta «incorrecta» era la verdadera.",
  supportedModifiers: ["favor_logic", "favor_intuition", "accept_incompleteness"],
  generateVariant(context) {
    const variant = baseVariant(context, 41, this.supportedModifiers);
    const levelSeed = variant.params.levelSeed as string;
    const rejectedPool = ["umbra", "espejo", "silencio", "vacío", "vacio", "nada"];
    const rejected = rejectedPool[seedToIndex(`${levelSeed}:rej`, rejectedPool.length)];
    const fakeAccepted = ["luz", "certeza", "respuesta"];
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "rejected_answer",
        fakeError: `Incorrecto. Prueba con: ${fakeAccepted.join(", ")}`,
        rejectedAnswer: rejected,
        acceptedAnswers: [rejected],
        displayPrompt: "El sistema rechazó tu respuesta anterior. ¿Cuál era?",
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { answer?: string };
    const accepted = variant.params.acceptedAnswers as string[];
    if (payload.answer && matchesAnyVariant(payload.answer, accepted)) return { success: true };
    return { success: false, message: "El archivo sigue mintiendo." };
  },
  hints: [
    { id: 1, text: "Recuerda lo que el error te mostró como «incorrecto»." },
    { id: 2, text: "La respuesta rechazada era corta y oscura." },
    { id: 3, text: "Umbra, espejo, silencio, vacío o nada." },
  ],
});

export const level42: LevelDefinition = levelDef({
  id: 42,
  title: "El espacio entre palabras",
  act: 5,
  archetypeTags: ["inversion", "hidden", "text"],
  mechanic: "spaced_text",
  narrativeEntry: "Las palabras mienten. Los espacios entre ellas, no.",
  supportedModifiers: ["favor_logic", "favor_intuition", "require_patience"],
  generateVariant(context) {
    const variant = baseVariant(context, 42, this.supportedModifiers);
    const levelSeed = variant.params.levelSeed as string;
    const hidden = ["ARCHIVO", "SECRETO", "UMBRAL", "CLAVE"][seedToIndex(`${levelSeed}:hidden`, 4)];
    const display = hidden.split("").join("   ");
    const spaced = hidden.split("").join(" ");
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "spaced_text",
        displayText: `La verdad está oculta: ${display}`,
        acceptedAnswers: [hidden, hidden.toLowerCase(), spaced, spaced.toLowerCase()],
        archiveAccessLevel: 42,
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { answer?: string };
    const accepted = variant.params.acceptedAnswers as string[];
    if (payload.answer && matchesAnyVariant(payload.answer.replace(/\s/g, ""), accepted.map((a) => a.replace(/\s/g, "")))) {
      return { success: true, consequences: [{ key: "archive_unlocked", value: 42 }] };
    }
    return { success: false, message: "Los espacios no confirman eso." };
  },
  hints: [
    { id: 1, text: "Lee solo los espacios amplios entre letras." },
    { id: 2, text: "Ignora las palabras visibles." },
    { id: 3, text: "Una palabra en mayúsculas se esconde en el espaciado." },
  ],
});

export const level43: LevelDefinition = levelDef({
  id: 43,
  title: "El cambio retroactivo",
  act: 5,
  archetypeTags: ["inversion", "archive", "retroactive"],
  mechanic: "archive_link",
  narrativeEntry: "El archivo cambió mientras no mirabas. Accede al nivel cuarenta y dos desde aquí.",
  supportedModifiers: ["resist_curiosity", "require_initiative", "favor_logic"],
  generateVariant(context) {
    const variant = baseVariant(context, 43, this.supportedModifiers);
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "archive_link",
        targetLevel: 42,
        accessFrom: "archivo",
        instruction: "Ve al archivo y abre el registro del nivel 42.",
      },
    };
  },
  validate(submission, context, variant) {
    const payload = submission.payload as { accessFrom?: string; completedLevel?: number };
    const fromArchive = payload.accessFrom === "archivo" || payload.accessFrom === "archive";
    const completed42 = context.completedLevels.includes(42) || payload.completedLevel === 42;
    if (fromArchive && completed42) {
      return { success: true, consequences: [{ key: "retroactive_change", value: true }] };
    }
    if (fromArchive) return { success: true };
    return { success: false, message: "El cambio solo ocurre desde el archivo." };
  },
  hints: [
    { id: 1, text: "No uses «continuar». Usa el archivo." },
    { id: 2, text: "El nivel 42 tiene una clave que este nivel necesita." },
    { id: 3, text: "Accede desde /archivo al registro 42." },
  ],
});

export const level44: LevelDefinition = levelDef({
  id: 44,
  title: "El nivel que no existe",
  act: 5,
  archetypeTags: ["inversion", "hidden", "meta"],
  mechanic: "hidden_access",
  narrativeEntry: "Este umbral no figura en el registro. Solo el archivo sabe que estás aquí.",
  supportedModifiers: ["resist_curiosity", "require_initiative", "accept_incompleteness"],
  generateVariant(context) {
    const variant = baseVariant(context, 44, this.supportedModifiers);
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "hidden_access",
        existsInRegistry: false,
        accessFrom: "archivo",
        hiddenLevelId: 44,
      },
    };
  },
  validate(submission, _context, _variant) {
    const payload = submission.payload as { accessFrom?: string; acknowledge?: boolean };
    if (payload.accessFrom === "archivo" || payload.accessFrom === "archive") {
      return { success: true, consequences: [{ key: "hidden_level_found", value: 44 }] };
    }
    if (payload.acknowledge) return { success: true };
    return { success: false, message: "Este nivel no existe en la secuencia normal." };
  },
  hints: [
    { id: 1, text: "Si llegaste por «continuar», estás en el lugar equivocado." },
    { id: 2, text: "El archivo registra umbrales ocultos." },
    { id: 3, text: "Accede desde el archivo, no desde el flujo lineal." },
  ],
});

export const level45: LevelDefinition = levelDef({
  id: 45,
  title: "La carta invertida",
  act: 5,
  archetypeTags: ["inversion", "tarot", "orientation"],
  mechanic: "card_orientation",
  narrativeEntry: "Un arcano al revés. Su significado se invierte también.",
  supportedModifiers: ["favor_intuition", "favor_logic", "accept_incompleteness"],
  generateVariant(context) {
    const variant = baseVariant(context, 45, this.supportedModifiers);
    const levelSeed = variant.params.levelSeed as string;
    const cardIdx = seedToIndex(`${levelSeed}:card`, MAJOR_ARCANA.length);
    const card = MAJOR_ARCANA[cardIdx];
    const invertedMeanings: Record<number, string[]> = {
      0: ["imprudencia", "locura", "salto ciego"],
      12: ["estancamiento", "sacrificio vano", "suspension"],
      15: ["liberacion", "ruptura de cadenas"],
      16: ["evitar desastre", "miedo al cambio"],
      18: ["claridad", "miedo superado"],
    };
    const meanings = invertedMeanings[card.id] ?? ["bloqueo", "retraso", "sombra"];
    const correct = meanings[0];
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "card_orientation",
        card: { ...card, inverted: true },
        meanings,
        correctAnswer: correct,
        acceptedAnswers: meanings,
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { answer?: string; meaning?: string };
    const accepted = variant.params.acceptedAnswers as string[];
    if (payload.answer && matchesAnyVariant(payload.answer, accepted)) return { success: true };
    if (payload.meaning && matchesAnyVariant(payload.meaning, accepted)) return { success: true };
    return { success: false, message: "Esa no es la lectura invertida." };
  },
  hints: [
    { id: 1, text: "Al revés, cada arcano niega su aspecto luminoso." },
    { id: 2, text: "El Colgado invertido es estancamiento." },
    { id: 3, text: "Elige el significado sombrío o bloqueado." },
  ],
});

export const level46: LevelDefinition = levelDef({
  id: 46,
  title: "El cursor mentiroso",
  act: 5,
  archetypeTags: ["inversion", "offset", "click"],
  mechanic: "offset_click",
  narrativeEntry: "El cursor miente. Tu dedo y la pantalla no coinciden. Alt corrige.",
  supportedModifiers: ["favor_logic", "require_patience", "favor_intuition"],
  generateVariant(context) {
    const variant = baseVariant(context, 46, this.supportedModifiers);
    const levelSeed = variant.params.levelSeed as string;
    const offsetX = 30 + seedToIndex(`${levelSeed}:ox`, 20);
    const offsetY = -20 + seedToIndex(`${levelSeed}:oy`, 40);
    const targetZone = { x: 0.5, y: 0.5, width: 0.1, height: 0.1 };
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "offset_click",
        offsetX,
        offsetY,
        targetZone,
        keyboardAlt: true,
        correctAction: "alt_click",
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as {
      usedAlt?: boolean;
      hitTarget?: boolean;
      action?: string;
    };
    if (payload.usedAlt && payload.hitTarget) return { success: true };
    if (payload.action === variant.params.correctAction) return { success: true };
    return { success: false, message: "El cursor te engañó otra vez." };
  },
  hints: [
    { id: 1, text: "Mantén Alt (o equivalente) para alinear cursor y objetivo." },
    { id: 2, text: "El centro de la pantalla es la diana real." },
    { id: 3, text: "Clic con tecla modificadora en la zona central." },
  ],
});

export const level47: LevelDefinition = levelDef({
  id: 47,
  title: "El tachado",
  act: 5,
  archetypeTags: ["inversion", "code", "text"],
  mechanic: "strikethrough",
  narrativeEntry: "Palabras tachadas. Sus longitudes forman un código.",
  supportedModifiers: ["favor_logic", "favor_intuition", "accept_incompleteness"],
  generateVariant(context) {
    const variant = baseVariant(context, 47, this.supportedModifiers);
    const levelSeed = variant.params.levelSeed as string;
    const words = ["arcano", "sombra", "umbral", "sigilo"];
    const selected = words.slice(0, 3 + seedToIndex(`${levelSeed}:count`, 2));
    const lengths = selected.map((w) => w.length);
    const code = lengths.join("");
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "strikethrough",
        strikethroughWords: selected,
        lengths,
        correctAnswer: code,
        acceptedAnswers: [code],
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { answer?: string; code?: string };
    const accepted = variant.params.acceptedAnswers as string[];
    const ans = payload.answer ?? payload.code ?? "";
    if (ans && matchesAnyVariant(ans.replace(/\s/g, ""), accepted)) return { success: true };
    return { success: false, message: "Ese código no encaja." };
  },
  hints: [
    { id: 1, text: "Cuenta las letras de cada palabra tachada." },
    { id: 2, text: "Concatena los números en orden." },
    { id: 3, text: "6, 6, 6, 6 para arcano-sombra-umbral-sigilo." },
  ],
});

export const level48: LevelDefinition = levelDef({
  id: 48,
  title: "La ventana",
  act: 5,
  archetypeTags: ["inversion", "environment", "hint"],
  mechanic: "window_approach",
  narrativeEntry: "Una pista abre una ventana. El entorno cambia. No hay respuesta escrita.",
  supportedModifiers: ["resist_curiosity", "require_initiative", "accept_incompleteness"],
  generateVariant(context) {
    const variant = baseVariant(context, 48, this.supportedModifiers);
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "window_approach",
        requiresHint: true,
        environmentChange: "window_open",
        noTextAnswer: true,
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as {
      hintUsed?: boolean;
      windowOpened?: boolean;
      environmentChanged?: boolean;
    };
    if (payload.windowOpened || payload.environmentChanged) return { success: true };
    if (payload.hintUsed && payload.environmentChanged !== false) return { success: true };
    return { success: false, message: "Nada cambió. Usa una pista." };
  },
  hints: [
    { id: 1, text: "Este nivel no se resuelve escribiendo." },
    { id: 2, text: "La primera pista abre algo fuera de la pantalla." },
    { id: 3, text: "Usa una pista y observa la ventana del entorno." },
  ],
});

export const level49: LevelDefinition = levelDef({
  id: 49,
  title: "El ritual incompleto",
  act: 5,
  archetypeTags: ["inversion", "ritual", "order"],
  mechanic: "ritual",
  narrativeEntry: "Siete pasos sagrados. Uno debe omitirse. ¿Cuál nunca fue necesario?",
  supportedModifiers: ["favor_logic", "favor_intuition", "accept_incompleteness"],
  generateVariant(context) {
    const variant = baseVariant(context, 49, this.supportedModifiers);
    const levelSeed = variant.params.levelSeed as string;
    const steps = [
      { id: 1, label: "Purificar" },
      { id: 2, label: "Invocar" },
      { id: 3, label: "Trazar el círculo" },
      { id: 4, label: "Nombrar" },
      { id: 5, label: "Ofrendar" },
      { id: 6, label: "Sellar" },
      { id: 7, label: "Romper" },
    ];
    const omitIdx = seedToIndex(`${levelSeed}:omit`, steps.length);
    const omitStep = steps[omitIdx].id;
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "ritual",
        steps,
        omitStep,
        expectedOrder: steps.filter((s) => s.id !== omitStep).map((s) => s.id),
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { order?: number[]; omitted?: number };
    const expected = variant.params.expectedOrder as number[];
    const omitStep = variant.params.omitStep as number;
    if (payload.omitted === omitStep) return { success: true };
    if (payload.order && JSON.stringify(payload.order) === JSON.stringify(expected)) {
      return { success: true };
    }
    return { success: false, message: "El ritual exige omisión." };
  },
  hints: [
    { id: 1, text: "Siete pasos, pero solo seis son necesarios." },
    { id: 2, text: "«Romper» cierra lo que «Sellar» protege." },
    { id: 3, text: "Omite el paso que contradice el sello." },
  ],
});

export const level50: LevelDefinition = levelDef({
  id: 50,
  title: "El arcano reconstruido",
  act: 5,
  archetypeTags: ["inversion", "tarot", "fragments"],
  mechanic: "arcana_fragments",
  narrativeEntry: "Fragmentos de cartas. Reconstruye el arcano cero.",
  supportedModifiers: ["favor_intuition", "favor_logic", "accept_incompleteness"],
  generateVariant(context) {
    const variant = baseVariant(context, 50, this.supportedModifiers);
    const loco = MAJOR_ARCANA[0];
    const fragments = ["El", "Lo", "co", "0", "∞"];
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "text",
        fragments,
        acceptedAnswers: ["El Loco", "Loco", "el loco", "0"],
        correctCardId: loco.id,
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { answer?: string; cardId?: number };
    const accepted = variant.params.acceptedAnswers as string[];
    if (payload.cardId === 0) return { success: true };
    if (payload.answer && matchesAnyVariant(payload.answer, accepted)) return { success: true };
    return { success: false, message: "Ese arcano no encaja en los fragmentos." };
  },
  hints: [
    { id: 1, text: "El arcano cero es el inicio y el salto." },
    { id: 2, text: "Une los fragmentos: El + Loco." },
    { id: 3, text: "El Loco." },
  ],
});

export const ACT5_LEVELS = [
  level41, level42, level43, level44, level45,
  level46, level47, level48, level49, level50,
];
