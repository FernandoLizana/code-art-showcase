import { matchesAnyVariant } from "@/lib/game/normalize";
import { seedToIndex } from "@/lib/security/hash";
import { baseVariant, levelDef } from "./base";
import type { LevelDefinition } from "@/types/game";

export const level71: LevelDefinition = levelDef({
  id: 71,
  title: "Lo que falta",
  act: 8,
  archetypeTags: ["absence", "missing", "ui"],
  mechanic: "missing_ui",
  narrativeEntry: "Un botón debería estar aquí. No lo está. ¿Qué acción falta?",
  supportedModifiers: ["favor_intuition", "accept_incompleteness", "favor_logic"],
  generateVariant(context) {
    const variant = baseVariant(context, 71, this.supportedModifiers);
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "missing_ui",
        missingElement: "submit_button",
        acceptedAnswers: ["continuar", "enviar", "submit", "siguiente", "nada"],
        correctAction: "nothing",
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { action?: string; answer?: string };
    if (payload.action === "nothing" || payload.action === "wait") return { success: true };
    const accepted = variant.params.acceptedAnswers as string[];
    if (payload.answer && matchesAnyVariant(payload.answer, ["nada", "nothing", "ninguna"])) {
      return { success: true };
    }
    return { success: false, message: "Buscar lo ausente no lo trae de vuelta." };
  },
  hints: [
    { id: 1, text: "No hay botón porque no debe haber acción." },
    { id: 2, text: "La ausencia es la respuesta." },
    { id: 3, text: "No hagas nada. Escribe «nada»." },
  ],
});

export const level72: LevelDefinition = levelDef({
  id: 72,
  title: "La página en blanco",
  act: 8,
  archetypeTags: ["absence", "blank", "hidden"],
  mechanic: "blank_page",
  narrativeEntry: "Blanco total. Selecciona el texto invisible.",
  supportedModifiers: ["favor_intuition", "require_patience", "favor_logic"],
  generateVariant(context) {
    const variant = baseVariant(context, 72, this.supportedModifiers);
    const levelSeed = variant.params.levelSeed as string;
    const words = ["vacío", "silencio", "ausencia"];
    const word = words[seedToIndex(`${levelSeed}:word`, words.length)];
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "blank_page",
        hiddenText: word,
        acceptedAnswers: [word, word.toUpperCase()],
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { answer?: string; selectedText?: string };
    const accepted = variant.params.acceptedAnswers as string[];
    if (payload.answer && matchesAnyVariant(payload.answer, accepted)) return { success: true };
    if (payload.selectedText && matchesAnyVariant(payload.selectedText, accepted)) return { success: true };
    return { success: false, message: "El blanco permanece." };
  },
  hints: [
    { id: 1, text: "Selecciona el área central de la página." },
    { id: 2, text: "Hay texto del color del fondo." },
    { id: 3, text: "Vacío, silencio o ausencia." },
  ],
});

export const level73: LevelDefinition = levelDef({
  id: 73,
  title: "El silencio",
  act: 8,
  archetypeTags: ["absence", "silence", "wait"],
  mechanic: "silence",
  narrativeEntry: "No escribas. No pulses. Solo silencio.",
  supportedModifiers: ["require_patience", "resist_curiosity", "accept_incompleteness"],
  generateVariant(context) {
    const variant = baseVariant(context, 73, this.supportedModifiers);
    const levelSeed = variant.params.levelSeed as string;
    const durationMs = 8000 + seedToIndex(`${levelSeed}:silence`, 7) * 1000;
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "silence",
        durationMs,
        correctAction: "silent_wait",
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as {
      waitedMs?: number;
      keyCount?: number;
      clickCount?: number;
      silent?: boolean;
    };
    const durationMs = variant.params.durationMs as number;
    if (payload.silent) return { success: true };
    if (
      (payload.waitedMs ?? 0) >= durationMs - 500 &&
      (payload.keyCount ?? 0) === 0 &&
      (payload.clickCount ?? 0) === 0
    ) {
      return { success: true };
    }
    return { success: false, message: "El silencio se rompió." };
  },
  hints: [
    { id: 1, text: "No interactúes durante el tiempo indicado." },
    { id: 2, text: "Cero teclas, cero clics." },
    { id: 3, text: "Espera en silencio completo." },
  ],
});

export const level74: LevelDefinition = levelDef({
  id: 74,
  title: "Sin etiquetas",
  act: 8,
  archetypeTags: ["absence", "unlabeled", "intuition"],
  mechanic: "unlabeled",
  narrativeEntry: "Tres formas idénticas. Solo una es hueco.",
  supportedModifiers: ["favor_intuition", "favor_logic", "accept_incompleteness"],
  generateVariant(context) {
    const variant = baseVariant(context, 74, this.supportedModifiers);
    const levelSeed = variant.params.levelSeed as string;
    const hollowIdx = seedToIndex(`${levelSeed}:hollow`, 3);
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "unlabeled",
        shapeCount: 3,
        correctIndex: hollowIdx,
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { index?: number; choice?: number };
    if (payload.index === variant.params.correctIndex || payload.choice === variant.params.correctIndex) {
      return { success: true };
    }
    return { success: false, message: "Esa forma está llena." };
  },
  hints: [
    { id: 1, text: "Pasa el cursor sobre cada forma." },
    { id: 2, text: "Una no responde al hover igual." },
    { id: 3, text: "El hueco es la ausencia de contenido." },
  ],
});

export const level75: LevelDefinition = levelDef({
  id: 75,
  title: "El espacio negativo",
  act: 8,
  archetypeTags: ["absence", "negative_space", "visual"],
  mechanic: "negative_space",
  narrativeEntry: "Las figuras forman una letra en el vacío entre ellas.",
  supportedModifiers: ["favor_intuition", "favor_logic", "accept_incompleteness"],
  generateVariant(context) {
    const variant = baseVariant(context, 75, this.supportedModifiers);
    const levelSeed = variant.params.levelSeed as string;
    const letters = ["A", "O", "X", "I"];
    const letter = letters[seedToIndex(`${levelSeed}:letter`, letters.length)];
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "negative_space",
        hiddenLetter: letter,
        acceptedAnswers: [letter, letter.toLowerCase()],
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { answer?: string };
    const accepted = variant.params.acceptedAnswers as string[];
    if (payload.answer && matchesAnyVariant(payload.answer, accepted)) return { success: true };
    return { success: false, message: "El vacío no forma eso." };
  },
  hints: [
    { id: 1, text: "Mira lo que no está dibujado." },
    { id: 2, text: "Las figuras delimitan una letra." },
    { id: 3, text: "A, O, X o I." },
  ],
});

export const level76: LevelDefinition = levelDef({
  id: 76,
  title: "Lo removido",
  act: 8,
  archetypeTags: ["absence", "removed", "memory"],
  mechanic: "removed_item",
  narrativeEntry: "Había cuatro objetos. Ahora hay tres. ¿Cuál fue removido?",
  supportedModifiers: ["favor_logic", "favor_intuition", "require_patience"],
  generateVariant(context) {
    const variant = baseVariant(context, 76, this.supportedModifiers);
    const levelSeed = variant.params.levelSeed as string;
    const items = ["vela", "espejo", "llave", "libro"];
    const removedIdx = seedToIndex(`${levelSeed}:removed`, items.length);
    const removed = items[removedIdx];
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "choice",
        presentItems: items.filter((_, i) => i !== removedIdx),
        options: items.map((i) => ({ id: i, label: i })),
        correctChoice: removed,
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { choice?: string };
    if (payload.choice === variant.params.correctChoice) return { success: true };
    return { success: false, message: "Ese objeto aún está presente." };
  },
  hints: [
    { id: 1, text: "Compara con lo que recuerdas ver." },
    { id: 2, text: "Uno de los cuatro clásicos falta." },
    { id: 3, text: "Elige el que no aparece entre los tres." },
  ],
});

export const level77: LevelDefinition = levelDef({
  id: 77,
  title: "Inventario vacío",
  act: 8,
  archetypeTags: ["absence", "empty", "inventory"],
  mechanic: "empty_inventory",
  narrativeEntry: "Tu inventario está vacío. Eso es lo que tienes. Confírmalo.",
  supportedModifiers: ["accept_incompleteness", "reward_honesty", "favor_logic"],
  generateVariant(context) {
    const variant = baseVariant(context, 77, this.supportedModifiers);
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "empty_inventory",
        items: [],
        acceptedAnswers: ["vacio", "vacío", "nada", "empty", "0"],
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { answer?: string; confirmEmpty?: boolean };
    const accepted = variant.params.acceptedAnswers as string[];
    if (payload.confirmEmpty) return { success: true };
    if (payload.answer && matchesAnyVariant(payload.answer, accepted)) return { success: true };
    return { success: false, message: "Aún buscas lo que no tienes." };
  },
  hints: [
    { id: 1, text: "No inventes objetos." },
    { id: 2, text: "Confirma la vacuidad." },
    { id: 3, text: "Escribe «vacío» o «nada»." },
  ],
});

export const level78: LevelDefinition = levelDef({
  id: 78,
  title: "La elección del vacío",
  act: 8,
  archetypeTags: ["absence", "void", "choice"],
  mechanic: "void_choice",
  narrativeEntry: "Tres opciones y un espacio vacío. Elige lo que no está listado.",
  supportedModifiers: ["favor_intuition", "accept_incompleteness", "reduce_control"],
  generateVariant(context) {
    const variant = baseVariant(context, 78, this.supportedModifiers);
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "void_choice",
        options: [
          { id: "luz", label: "Luz" },
          { id: "sombra", label: "Sombra" },
          { id: "camino", label: "Camino" },
        ],
        correctChoice: "void",
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { choice?: string };
    if (payload.choice === "void" || payload.choice === "vacio" || payload.choice === "vacío") {
      return { success: true };
    }
    return { success: false, message: "Elegiste lo que existe." };
  },
  hints: [
    { id: 1, text: "Hay una cuarta opción invisible." },
    { id: 2, text: "No elijas luz, sombra ni camino." },
    { id: 3, text: "Selecciona el espacio vacío." },
  ],
});

export const level79: LevelDefinition = levelDef({
  id: 79,
  title: "Casi nada",
  act: 8,
  archetypeTags: ["absence", "minimal", "patience"],
  mechanic: "minimal",
  narrativeEntry: "Un punto. Nada más. Mantén la mirada.",
  supportedModifiers: ["require_patience", "accept_incompleteness", "favor_intuition"],
  generateVariant(context) {
    const variant = baseVariant(context, 79, this.supportedModifiers);
    const levelSeed = variant.params.levelSeed as string;
    const durationMs = 6000 + seedToIndex(`${levelSeed}:min`, 6) * 1000;
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "minimal",
        durationMs,
        correctAction: "gaze",
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { gazedMs?: number; completed?: boolean };
    const durationMs = variant.params.durationMs as number;
    if (payload.completed) return { success: true };
    if ((payload.gazedMs ?? 0) >= durationMs - 500) return { success: true };
    return { success: false, message: "Apartaste la mirada demasiado pronto." };
  },
  hints: [
    { id: 1, text: "No busques más elementos." },
    { id: 2, text: "Mira el punto el tiempo indicado." },
    { id: 3, text: "La paciencia es la única acción." },
  ],
});

export const level80: LevelDefinition = levelDef({
  id: 80,
  title: "Ain",
  act: 8,
  archetypeTags: ["absence", "ain", "void"],
  mechanic: "ain",
  narrativeEntry: "אין — Nada. Ni siquiera esta palabra debería existir.",
  supportedModifiers: ["accept_incompleteness", "require_patience", "favor_intuition"],
  generateVariant(context) {
    const variant = baseVariant(context, 80, this.supportedModifiers);
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "empty_submit",
        correctAction: "empty_submit",
        noInput: true,
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as {
      action?: string;
      empty?: boolean;
      answer?: string;
    };
    if (payload.action === "empty_submit" || payload.empty === true) return { success: true };
    if (payload.answer === "" || payload.answer === undefined) return { success: true };
    return { success: false, message: "Ain no contiene respuesta." };
  },
  hints: [
    { id: 1, text: "En la cábala, Ain es la nada absoluta." },
    { id: 2, text: "Envía vacío. Sin texto." },
    { id: 3, text: "Pulsa enviar sin escribir nada." },
  ],
});

export const ACT8_LEVELS = [
  level71, level72, level73, level74, level75,
  level76, level77, level78, level79, level80,
];
