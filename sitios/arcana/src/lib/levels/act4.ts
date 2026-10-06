import { matchesAnyVariant } from "@/lib/game/normalize";
import {
  MAJOR_ARCANA,
  SEFIROT,
  VALID_TREE_CONNECTIONS,
  normalizeSefiraId,
  MIN_VALID_CONNECTIONS,
} from "@/lib/tarot/constants";
import { seedToIndex } from "@/lib/security/hash";
import { deriveSequenceFromSeed } from "@/lib/security/seed";
import { baseVariant, isHighTrait, levelDef } from "./base";
import type { LevelDefinition } from "@/types/game";

function getBorrowedWord(context: import("@/types/game").PlayerContext): string {
  const fromWords = context.words.find((w) => w.length > 3);
  if (fromWords) return fromWords;
  const name = context.personality?.borrowedName ?? "Mara Vex";
  return name.split("").reverse().join("");
}

export const level31: LevelDefinition = levelDef({
  id: 31,
  title: "La habitación de Maljut",
  act: 4,
  archetypeTags: ["cabala", "maljut", "kingdom"],
  mechanic: "maljut_room",
  narrativeEntry: "Reino terrenal. Objetos cotidianos elevados a símbolos. ¿Cuál gobierna?",
  supportedModifiers: ["favor_logic", "favor_intuition", "reduce_control"],
  generateVariant(context) {
    const variant = baseVariant(context, 31, this.supportedModifiers);
    const levelSeed = variant.params.levelSeed as string;
    const objects = [
      { id: "corona", label: "Corona de paja" },
      { id: "sello", label: "Sello roto" },
      { id: "mapa", label: "Mapa sin norte" },
      { id: "llave", label: "Llave oxidada" },
    ];
    const correctId = objects[seedToIndex(`${levelSeed}:obj`, objects.length)].id;
    return {
      ...variant,
      params: { ...variant.params, uiType: "choice", options: objects, correctChoice: correctId },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { choice?: string };
    if (payload.choice === variant.params.correctChoice) return { success: true };
    return { success: false, message: "Ese objeto no rige este reino." };
  },
  hints: [
    { id: 1, text: "Maljut es el reino manifestado, lo concreto." },
    { id: 2, text: "Uno de los objetos muestra poder sin autoridad." },
    { id: 3, text: "La corona de paja gobierna lo aparente." },
  ],
});

export const level32: LevelDefinition = levelDef({
  id: 32,
  title: "Los recuerdos de Yesod",
  act: 4,
  archetypeTags: ["cabala", "yesod", "memory"],
  mechanic: "yesod_memories",
  narrativeEntry: "Fundamento invisible. Imágenes que no ocurrieron. Una sí ocurrió.",
  supportedModifiers: ["favor_intuition", "require_patience", "favor_logic"],
  generateVariant(context) {
    const variant = baseVariant(context, 32, this.supportedModifiers);
    const levelSeed = variant.params.levelSeed as string;
    const memories = [
      "Una puerta sin nombre",
      "Veintiún arcanos",
      "Un nombre prestado",
      "Un árbol incompleto",
      "Una promesa rota",
    ];
    const realIdx = seedToIndex(`${levelSeed}:real`, memories.length);
    const shuffled = [...memories].sort(
      (a, b) => seedToIndex(`${levelSeed}:${a}`, 50) - seedToIndex(`${levelSeed}:${b}`, 50),
    );
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "memory_select",
        memories: shuffled.map((m, i) => ({ id: i, text: m })),
        correctIndex: shuffled.indexOf(memories[realIdx]),
        correctMemory: memories[realIdx],
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { index?: number; memory?: string };
    if (payload.index === variant.params.correctIndex) return { success: true };
    if (payload.memory === variant.params.correctMemory) return { success: true };
    return { success: false, message: "Ese recuerdo no cimenta Yesod." };
  },
  hints: [
    { id: 1, text: "Yesod conecta lo superior con lo manifestado." },
    { id: 2, text: "Solo uno de estos recuerdos es tuyo." },
    { id: 3, text: "El nombre prestado fue real." },
  ],
});

export const level33: LevelDefinition = levelDef({
  id: 33,
  title: "El lenguaje de Hod",
  act: 4,
  archetypeTags: ["cabala", "hod", "language"],
  mechanic: "hod_language",
  narrativeEntry: "Esplendor de la palabra. Cada letra es un sendero. Descifra el verbo.",
  supportedModifiers: ["favor_logic", "favor_intuition", "accept_incompleteness"],
  generateVariant(context) {
    const variant = baseVariant(context, 33, this.supportedModifiers);
    const levelSeed = variant.params.levelSeed as string;
    const words = ["verdad", "silencio", "nombre", "sendero"];
    const word = words[seedToIndex(`${levelSeed}:word`, words.length)];
    const cipher = word
      .split("")
      .map((c, i) => String.fromCharCode(c.charCodeAt(0) + (i % 2 === 0 ? 1 : -1)))
      .join("");
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "text",
        displayText: cipher,
        acceptedAnswers: [word, word.toUpperCase()],
        placeholder: "La palabra original...",
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { answer?: string };
    const accepted = variant.params.acceptedAnswers as string[];
    if (payload.answer && matchesAnyVariant(payload.answer, accepted)) return { success: true };
    return { success: false, message: "Hod no reconoce esa palabra." };
  },
  hints: [
    { id: 1, text: "Alterna sumar y restar uno al código ASCII de cada letra." },
    { id: 2, text: "La palabra es corta y esencial." },
    { id: 3, text: "Verdad, silencio, nombre o sendero." },
  ],
});

export const level34: LevelDefinition = levelDef({
  id: 34,
  title: "La emoción de Netzaj",
  act: 4,
  archetypeTags: ["cabala", "netzaj", "emotion"],
  mechanic: "netzaj_emotion",
  narrativeEntry: "Victoria sin conquista. Elige la emoción que no compite.",
  supportedModifiers: ["require_boundaries", "reward_honesty", "reduce_control"],
  generateVariant(context) {
    const variant = baseVariant(context, 34, this.supportedModifiers);
    const dominant = context.personality?.dominantDimension ?? "curiosidad";
    const competitive = ["ira", "envidia", "orgullo", "codicia"];
    const peaceful = ["gratitud", "serenidad", "compasion", "asombro"];
    const needPeace = isHighTrait(context, "dominancia") || isHighTrait(context, "impulsividad");
    const correctChoice = needPeace ? peaceful[0] : competitive[0];
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "choice",
        options: [...competitive, ...peaceful].map((e) => ({ id: e, label: e })),
        correctChoice,
        dominantDimension: dominant,
      },
    };
  },
  validate(submission, context, variant) {
    const payload = submission.payload as { choice?: string };
    const needPeace = isHighTrait(context, "dominancia") || isHighTrait(context, "impulsividad");
    const peaceful = ["gratitud", "serenidad", "compasion", "asombro"];
    const competitive = ["ira", "envidia", "orgullo", "codicia"];
    const valid = needPeace ? peaceful : competitive;
    if (payload.choice && valid.includes(payload.choice)) return { success: true };
    return { success: false, message: "Netzaj no celebra esa emoción." };
  },
  hints: [
    { id: 1, text: "Netzaj vence sin destruir." },
    { id: 2, text: "Tu perfil indica si debes elegir calma o fuego." },
    { id: 3, text: "Los impulsivos eligen serenidad. Los sumisos, orgullo." },
  ],
});

export const level35: LevelDefinition = levelDef({
  id: 35,
  title: "La alineación de Tiféret",
  act: 4,
  archetypeTags: ["cabala", "tiferet", "align"],
  mechanic: "tiferet_align",
  narrativeEntry: "Belleza en el centro. Alinea lo superior con lo inferior.",
  supportedModifiers: ["favor_logic", "reduce_control", "accept_incompleteness"],
  generateVariant(context) {
    const variant = baseVariant(context, 35, this.supportedModifiers);
    const sefira = SEFIROT.find((s) => s.id === "tiferet")!;
    const upper = ["keter", "jojma", "bina"];
    const lower = ["jesed", "guevura", "netzaj", "hod", "yesod", "maljut"];
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "align",
        centerSefira: sefira,
        upperSefirot: upper,
        lowerSefirot: lower,
        correctAlignment: ["keter", "tiferet", "maljut"],
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { alignment?: string[] };
    const correct = variant.params.correctAlignment as string[];
    if (payload.alignment && JSON.stringify(payload.alignment) === JSON.stringify(correct)) {
      return { success: true };
    }
    if (
      payload.alignment?.includes("tiferet") &&
      payload.alignment.includes("keter") &&
      payload.alignment.includes("maljut")
    ) {
      return { success: true };
    }
    return { success: false, message: "Tiféret no brilla en ese eje." };
  },
  hints: [
    { id: 1, text: "Tiféret es el corazón del árbol." },
    { id: 2, text: "Conecta la corona con el reino pasando por el centro." },
    { id: 3, text: "Kéter — Tiféret — Maljut." },
  ],
});

export const level36: LevelDefinition = levelDef({
  id: 36,
  title: "La eliminación de Guevurá",
  act: 4,
  archetypeTags: ["cabala", "guevura", "eliminate"],
  mechanic: "guevura_eliminate",
  narrativeEntry: "Rigor sin piedad. Uno de estos no merece permanecer.",
  supportedModifiers: ["require_boundaries", "favor_logic", "reduce_control"],
  generateVariant(context) {
    const variant = baseVariant(context, 36, this.supportedModifiers);
    const levelSeed = variant.params.levelSeed as string;
    const items = [
      { id: "mentira", label: "Mentira piadosa" },
      { id: "exceso", label: "Exceso de bondad" },
      { id: "miedo", label: "Miedo disfrazado" },
      { id: "orgullo", label: "Orgullo oculto" },
    ];
    const eliminate = items[seedToIndex(`${levelSeed}:elim`, items.length)].id;
    return {
      ...variant,
      params: { ...variant.params, uiType: "eliminate", items, correctChoice: eliminate },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { eliminated?: string; choice?: string };
    const correct = variant.params.correctChoice as string;
    if (payload.eliminated === correct || payload.choice === correct) return { success: true };
    return { success: false, message: "Guevurá conserva lo incorrecto." };
  },
  hints: [
    { id: 1, text: "Guevurá corta lo que corrompe." },
    { id: 2, text: "Uno de los cuatro es la raíz del desequilibrio." },
    { id: 3, text: "Elimina lo que parece virtud pero es cobardía." },
  ],
});

export const level37: LevelDefinition = levelDef({
  id: 37,
  title: "La distribución de Jesed",
  act: 4,
  archetypeTags: ["cabala", "jesed", "distribute"],
  mechanic: "jesed_distribute",
  narrativeEntry: "Misericordia abundante. Reparte sin quedarte vacío.",
  supportedModifiers: ["reward_honesty", "reduce_control", "require_boundaries"],
  generateVariant(context) {
    const variant = baseVariant(context, 37, this.supportedModifiers);
    const levelSeed = variant.params.levelSeed as string;
    const total = 12;
    const recipients = 3;
    const perEach = total / recipients;
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "distribute",
        totalUnits: total,
        recipients: ["extranjero", "hermano", "enemigo"],
        targetPerRecipient: perEach,
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { distribution?: number[] };
    const target = variant.params.targetPerRecipient as number;
    const dist = payload.distribution ?? [];
    if (dist.length === 3 && dist.every((n) => n === target) && dist.reduce((a, b) => a + b, 0) === 12) {
      return { success: true };
    }
    return { success: false, message: "Jesed no acepta esa distribución." };
  },
  hints: [
    { id: 1, text: "Divide equitativamente entre los tres." },
    { id: 2, text: "Incluso el enemigo recibe su parte." },
    { id: 3, text: "Cuatro unidades para cada uno." },
  ],
});

export const level38: LevelDefinition = levelDef({
  id: 38,
  title: "El entendimiento de Biná",
  act: 4,
  archetypeTags: ["cabala", "bina", "word"],
  mechanic: "bina_word",
  narrativeEntry: "Biná comprende lo que otros olvidaron. Una palabra regresa.",
  supportedModifiers: ["favor_logic", "favor_intuition", "accept_incompleteness"],
  generateVariant(context) {
    const variant = baseVariant(context, 38, this.supportedModifiers);
    const word = getBorrowedWord(context);
    const reversed = word.split("").reverse().join("");
    const accepted = [word, reversed, word.toLowerCase(), reversed.toLowerCase()];
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "text",
        prompt: "Escribe la palabra que el archivo te prestó, o su reflejo.",
        acceptedAnswers: accepted,
        requiresPriorLevel: 7,
      },
    };
  },
  validate(submission, context, variant) {
    const payload = submission.payload as { answer?: string };
    const accepted = variant.params.acceptedAnswers as string[];
    const name = context.personality?.borrowedName ?? "";
    const reversed = name.split("").reverse().join("");
    const allAccepted = [...accepted, reversed, reversed.toLowerCase()];
    if (payload.answer && matchesAnyVariant(payload.answer.replace(/\s/g, ""), allAccepted)) {
      return { success: true, consequences: [{ key: "words", value: getBorrowedWord(context) }] };
    }
    return { success: false, message: "Biná no reconoce esa palabra." };
  },
  hints: [
    { id: 1, text: "Recuerda el nivel siete." },
    { id: 2, text: "El nombre prestado o su reverso." },
    { id: 3, text: "Escribe el nombre al revés, sin espacios." },
  ],
});

export const level39: LevelDefinition = levelDef({
  id: 39,
  title: "La intuición de Jojmá",
  act: 4,
  archetypeTags: ["cabala", "jojma", "intuitive"],
  mechanic: "jojma_intuitive",
  narrativeEntry: "Sabiduría sin prueba. Elige sin calcular.",
  supportedModifiers: ["favor_intuition", "favor_logic", "accept_incompleteness"],
  generateVariant(context) {
    const variant = baseVariant(context, 39, this.supportedModifiers);
    const levelSeed = variant.params.levelSeed as string;
    const symbols = deriveSequenceFromSeed(`${levelSeed}:jojma`, 4, ["☿", "♀", "♂", "♃"]);
    const correctIndex = seedToIndex(`${levelSeed}:pick`, symbols.length);
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "intuitive_pick",
        symbols,
        correctIndex,
        instruction: "No pienses. Señala.",
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { index?: number; choice?: number };
    const correct = variant.params.correctIndex as number;
    if (payload.index === correct || payload.choice === correct) return { success: true };
    return { success: false, message: "Jojmá guarda silencio." };
  },
  hints: [
    { id: 1, text: "La lógica no abre Jojmá." },
    { id: 2, text: "Tu primera inclinación es la respuesta." },
    { id: 3, text: "Confía en el símbolo que te detuvo." },
  ],
});

export const level40: LevelDefinition = levelDef({
  id: 40,
  title: "Kéter y las decisiones",
  act: 4,
  archetypeTags: ["cabala", "keter", "tree"],
  mechanic: "keter_decisions",
  narrativeEntry: "Corona del árbol. Cada sendero que elegiste existe aquí.",
  supportedModifiers: ["favor_logic", "reduce_control", "accept_incompleteness"],
  generateVariant(context) {
    const variant = baseVariant(context, 40, this.supportedModifiers);
    const threshold = (context.narrative.threshold_choice as string) ?? "silencio";
    const decisions = [
      { id: "silencio", label: "El Silencio" },
      { id: "filo", label: "El Filo" },
      { id: "raiz", label: "La Raíz" },
    ];
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "tree_decisions",
        decisions,
        priorChoice: threshold,
        minConnections: MIN_VALID_CONNECTIONS - 4,
        placedSefirot: ["keter", "jojma", "bina", "tiferet", "maljut"],
      },
    };
  },
  validate(submission, context, variant) {
    const payload = submission.payload as {
      connections?: [string, string][];
      affirmedChoice?: string;
    };
    const prior = (context.narrative.threshold_choice as string) ?? variant.params.priorChoice;
    if (payload.affirmedChoice && payload.affirmedChoice !== prior) {
      return { success: false, message: "Esa no fue tu decisión en el umbral." };
    }
    const connections = (payload.connections ?? []).map(
      ([a, b]) => [normalizeSefiraId(a), normalizeSefiraId(b)].sort() as [string, string],
    );
    const validSet = new Set(
      VALID_TREE_CONNECTIONS.map(([a, b]) =>
        [normalizeSefiraId(a), normalizeSefiraId(b)].sort().join(":"),
      ),
    );
    let validCount = 0;
    for (const conn of connections) {
      if (validSet.has(conn.join(":"))) validCount++;
      else return { success: false, message: "Ese sendero no existe." };
    }
    const minConnections = variant.params.minConnections as number;
    if (validCount >= minConnections && (payload.affirmedChoice === prior || !payload.affirmedChoice)) {
      return { success: true, consequences: [{ key: "tree_complete", value: true }] };
    }
    return { success: false, message: "Kéter aún no corona tu camino." };
  },
  hints: [
    { id: 1, text: "Afirma la carta que elegiste en el nivel diez." },
    { id: 2, text: "Completa conexiones válidas del árbol." },
    { id: 3, text: "Silencio, Filo o Raíz — tu umbral inicial." },
  ],
});

export const ACT4_LEVELS = [
  level31, level32, level33, level34, level35,
  level36, level37, level38, level39, level40,
];
