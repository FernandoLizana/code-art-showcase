import type {
  LevelDefinition,
  LevelSubmission,
  LevelVariant,
  PlayerContext,
  ValidationResult,
} from "@/types/game";
import { deriveSeed, seedToIndex } from "@/lib/security/hash";
import { deriveSequenceFromSeed } from "@/lib/security/seed";
import { selectLevelModifier } from "@/lib/personality/modifiers";
import { matchesAnyVariant } from "@/lib/game/normalize";
import { MAJOR_ARCANA } from "@/lib/tarot/constants";
import {
  normalizeSefiraId,
  REQUIRED_SEFIROT,
  VALID_TREE_CONNECTIONS,
  MIN_VALID_CONNECTIONS,
} from "@/lib/tarot/constants";
import { ACT1_LEVELS_EXTRA } from "./act1-extra";
import { ACT2_LEVELS } from "./act2";
import { ACT3_LEVELS } from "./act3";
import { ACT4_LEVELS } from "./act4";
import { ACT5_LEVELS } from "./act5";
import { ACT6_LEVELS } from "./act6";
import { ACT7_LEVELS } from "./act7";
import { ACT8_LEVELS } from "./act8";
import { ACT9_LEVELS } from "./act9";
import { ACT10_LEVELS } from "./act10";

function baseVariant(
  context: PlayerContext,
  levelId: number,
  supported: LevelDefinition["supportedModifiers"],
): LevelVariant {
  const levelSeed = deriveSeed(context.seed, levelId, context.personality?.gameSeed ?? "");
  const modifier = context.personality
    ? selectLevelModifier(supported, context.personality.contraryModifiers, levelSeed)
    : supported[0];

  return { modifier, params: { levelSeed } };
}

export const level01: LevelDefinition = {
  id: 1,
  title: "La puerta sin nombre",
  act: 1,
  archetypeTags: ["initiation", "observation"],
  mechanic: "mark_selection",
  narrativeEntry:
    "Siete marcas en una puerta. Seis responden al tacto. Una finge indiferencia.",
  supportedModifiers: ["require_patience", "require_quick_action", "resist_curiosity"],
  generateVariant(context) {
    const variant = baseVariant(context, 1, this.supportedModifiers);
    const inactiveMark = seedToIndex(variant.params.levelSeed as string, 7);
    const waitWindow =
      variant.modifier === "require_quick_action"
        ? { enabled: true, durationMs: 8000, startDelayMs: 3000 }
        : { enabled: false, durationMs: 0, startDelayMs: 0 };
    const clickPenalty = variant.modifier === "require_patience";
    return {
      ...variant,
      params: { ...variant.params, inactiveMark, waitWindow, clickPenalty },
    };
  },
  validate(submission, context, variant) {
    const payload = submission.payload as { markIndex?: number; clickCount?: number };
    const inactiveMark = variant.params.inactiveMark as number;
    const clickPenalty = variant.params.clickPenalty as boolean;

    if (clickPenalty && (payload.clickCount ?? 0) > 3) {
      return { success: false, message: "Demasiado prisa. La puerta permanece cerrada." };
    }

    if (payload.markIndex === inactiveMark) {
      return { success: true, consequences: [{ key: "door_opened", value: true }] };
    }
    return { success: false, message: "La marca reacciona, pero no cede." };
  },
  hints: [
    { id: 1, text: "Una de las marcas no desea ser tocada." },
    { id: 2, text: "Prueba cada marca. Observa cuál no responde igual." },
    { id: 3, text: "La que permanece inerte abre lo demás." },
  ],
  accessibilityMode: {
    keyboardAlternative: true,
    visualAudioAlternative: true,
    colorBlindMode: true,
    reducedMotionSafe: true,
  },
};

export const level02: LevelDefinition = {
  id: 2,
  title: "La carta ausente",
  act: 1,
  archetypeTags: ["tarot", "memory"],
  mechanic: "missing_card",
  narrativeEntry: "Veintiún arcanos dispuestos. El mazo exige veintidós.",
  supportedModifiers: ["favor_logic", "favor_intuition", "accept_incompleteness"],
  generateVariant(context) {
    const variant = baseVariant(context, 2, this.supportedModifiers);
    const levelSeed = variant.params.levelSeed as string;
    const spreadSize = 10;
    const missingIndex = seedToIndex(`${levelSeed}:missing`, MAJOR_ARCANA.length);
    const missingCard = MAJOR_ARCANA[missingIndex];

    const spreadIndices = new Set<number>();
    let attempts = 0;
    while (spreadIndices.size < spreadSize && attempts < 100) {
      const idx = seedToIndex(`${levelSeed}:spread${attempts}`, MAJOR_ARCANA.length);
      if (idx !== missingIndex) {
        spreadIndices.add(idx);
      }
      attempts++;
    }

    const spread = [...spreadIndices]
      .map((i) => MAJOR_ARCANA[i])
      .sort((a, b) => a.id - b.id);

    return {
      ...variant,
      params: { missingCardId: missingCard.id, missingCardName: missingCard.name, spread },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { cardId?: number; cardName?: string };
    const expectedId = variant.params.missingCardId as number;
    const expectedName = variant.params.missingCardName as string;

    if (payload.cardId === expectedId) return { success: true };
    if (payload.cardName && matchesAnyVariant(payload.cardName, [expectedName])) {
      return { success: true };
    }
    return { success: false, message: "Ese arcano ya está presente." };
  },
  hints: [
    { id: 1, text: "Cuenta los arcanos mayores. Deberían ser veintidós." },
    { id: 2, text: "No elijas una carta visible. Busca la ausencia." },
    { id: 3, text: "Del 0 al 21, uno no apareció en la tirada." },
  ],
  accessibilityMode: {
    keyboardAlternative: true,
    visualAudioAlternative: true,
    colorBlindMode: true,
    reducedMotionSafe: true,
  },
  consequences: [{ key: "cards_seen", value: "major_spread" }],
};

export const level03: LevelDefinition = {
  id: 3,
  title: "La habitación negra",
  act: 1,
  archetypeTags: ["darkness", "intuition"],
  mechanic: "hidden_text",
  narrativeEntry: "Nada. Ni siquiera la certeza de estar despierto.",
  supportedModifiers: ["favor_intuition", "favor_logic", "accept_incompleteness"],
  generateVariant(context) {
    const variant = baseVariant(context, 3, this.supportedModifiers);
    const levelSeed = variant.params.levelSeed as string;
    const useVariant =
      variant.modifier === "favor_logic" && seedToIndex(`${levelSeed}:alt`, 3) === 0;
    const answer = useVariant ? "La Sacerdotisa" : "La Emperatriz";
    const acceptedAnswers = useVariant
      ? ["La Sacerdotisa", "Sacerdotisa", "II", "Arcano II"]
      : ["La Emperatriz", "Emperatriz", "III", "Arcano III"];

    return {
      ...variant,
      params: {
        answer,
        acceptedAnswers,
        hiddenZone: { x: 0.35, y: 0.55, width: 0.3, height: 0.08 },
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { answer?: string };
    const accepted = variant.params.acceptedAnswers as string[];
    if (payload.answer && matchesAnyVariant(payload.answer, accepted)) {
      return { success: true };
    }
    return { success: false, message: "La oscuridad no reconoce eso." };
  },
  hints: [
    { id: 1, text: "Hay algo en la negrura que solo aparece cuando buscas." },
    { id: 2, text: "Mueve tu atención hacia el centro-inferior de la nada." },
    { id: 3, text: "Arcano de fecundidad y silencio. Tres o dos, según lo que recuerdes." },
  ],
  accessibilityMode: {
    keyboardAlternative: true,
    visualAudioAlternative: true,
    colorBlindMode: true,
    reducedMotionSafe: true,
  },
};

export const level04: LevelDefinition = {
  id: 4,
  title: "No mires",
  act: 1,
  archetypeTags: ["observation", "memory"],
  mechanic: "averted_gaze",
  narrativeEntry: "Un ojo abierto. Cierra cuando lo observas.",
  supportedModifiers: ["require_patience", "resist_curiosity", "favor_intuition"],
  generateVariant(context) {
    const variant = baseVariant(context, 4, this.supportedModifiers);
    const levelSeed = variant.params.levelSeed as string;
    const symbols = ["☉", "☽", "△", "▽", "○", "□"];
    const sequence = deriveSequenceFromSeed(levelSeed, 4, symbols);
    return {
      ...variant,
      params: { ...variant.params, sequence, sequenceJoined: sequence.join("") },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { sequence?: string; symbols?: string[] };
    const expected = variant.params.sequence as string[];
    const expectedJoined = variant.params.sequenceJoined as string;

    if (payload.symbols && JSON.stringify(payload.symbols) === JSON.stringify(expected)) {
      return { success: true };
    }
    if (payload.sequence && matchesAnyVariant(payload.sequence.replace(/\s/g, ""), [expectedJoined])) {
      return { success: true };
    }
    return { success: false, message: "El ojo no reconoce esa secuencia." };
  },
  hints: [
    { id: 1, text: "El ojo muestra la verdad cuando crees que no miras." },
    { id: 2, text: "Aparta el cursor y recuerda lo que cambió." },
    { id: 3, text: "Cuatro símbolos, en orden, vistos solo de reojo." },
  ],
  accessibilityMode: {
    keyboardAlternative: true,
    visualAudioAlternative: true,
    colorBlindMode: true,
    reducedMotionSafe: true,
  },
};

export const level05: LevelDefinition = {
  id: 5,
  title: "Kéter",
  act: 1,
  archetypeTags: ["cabala", "tree_of_life"],
  mechanic: "tree_builder",
  narrativeEntry: "Una esfera solitaria. Kéter. El resto aún no existe.",
  supportedModifiers: ["favor_logic", "reduce_control", "accept_incompleteness"],
  generateVariant(context) {
    const variant = baseVariant(context, 5, this.supportedModifiers);
    const minConnections =
      variant.modifier === "accept_incompleteness" ? MIN_VALID_CONNECTIONS - 2 : MIN_VALID_CONNECTIONS;
    return { ...variant, params: { minConnections, placedSefirot: ["keter"] } };
  },
  validate(submission, context, variant) {
    const payload = submission.payload as {
      connections?: [string, string][];
      placedSefirot?: string[];
    };

    const connections = (payload.connections ?? []).map(
      ([a, b]) => [normalizeSefiraId(a), normalizeSefiraId(b)].sort() as [string, string],
    );
    const placed = new Set((payload.placedSefirot ?? []).map(normalizeSefiraId));

    for (const req of REQUIRED_SEFIROT) {
      if (!placed.has(req)) {
        return { success: false, message: `Falta ${req}. El árbol está incompleto.` };
      }
    }

    const validSet = new Set(
      VALID_TREE_CONNECTIONS.map(([a, b]) => [normalizeSefiraId(a), normalizeSefiraId(b)].sort().join(":")),
    );

    let validCount = 0;
    for (const conn of connections) {
      const key = conn.join(":");
      if (validSet.has(key)) validCount++;
      else return { success: false, message: "Un sendero no existe en este árbol." };
    }

    const minConnections = variant.params.minConnections as number;
    if (validCount < minConnections) {
      return {
        success: false,
        message: `Necesitas al menos ${minConnections} conexiones válidas.`,
      };
    }

    return {
      success: true,
      consequences: [
        { key: "tree_built", value: true },
        { key: "words", value: context.personality?.borrowedName ?? "keter" },
      ],
    };
  },
  hints: [
    { id: 1, text: "Desde Kéter emergen tres caminos superiores." },
    { id: 2, text: "Diez esferas, veintidós senderos. No todos son necesarios ahora." },
    { id: 3, text: "Tiféret conecta lo superior con lo inferior." },
  ],
  accessibilityMode: {
    keyboardAlternative: true,
    visualAudioAlternative: true,
    colorBlindMode: true,
    reducedMotionSafe: true,
  },
};

function createStubLevel(id: number): LevelDefinition {
  const act = Math.ceil(id / 10);
  return {
    id,
    title: `Nivel ${id}`,
    act,
    archetypeTags: ["pending"],
    mechanic: "stub",
    narrativeEntry: "Este umbral aún no ha sido cruzado por el archivo.",
    supportedModifiers: ["require_patience"],
    generateVariant(context) {
      return baseVariant(context, id, ["require_patience"]);
    },
    validate(): ValidationResult {
      return { success: false, message: "Este nivel aún no está disponible." };
    },
    hints: [
      { id: 1, text: "..." },
      { id: 2, text: "..." },
      { id: 3, text: "..." },
    ],
    accessibilityMode: {
      keyboardAlternative: true,
      visualAudioAlternative: true,
      colorBlindMode: true,
      reducedMotionSafe: true,
    },
  };
}

const IMPLEMENTED: LevelDefinition[] = [
  level01,
  level02,
  level03,
  level04,
  level05,
  ...ACT1_LEVELS_EXTRA,
  ...ACT2_LEVELS,
  ...ACT3_LEVELS,
  ...ACT4_LEVELS,
  ...ACT5_LEVELS,
  ...ACT6_LEVELS,
  ...ACT7_LEVELS,
  ...ACT8_LEVELS,
  ...ACT9_LEVELS,
  ...ACT10_LEVELS,
];

const ALL_LEVELS: LevelDefinition[] = [];
for (let i = 1; i <= 100; i++) {
  const impl = IMPLEMENTED.find((l) => l.id === i);
  ALL_LEVELS.push(impl ?? createStubLevel(i));
}

export const LEVEL_REGISTRY = ALL_LEVELS;

export function getLevel(id: number): LevelDefinition | undefined {
  return LEVEL_REGISTRY.find((l) => l.id === id);
}

export function validateLevelSubmission(
  levelId: number,
  submission: LevelSubmission,
  context: PlayerContext,
  variant: LevelVariant,
): ValidationResult {
  const level = getLevel(levelId);
  if (!level) return { success: false, message: "Nivel no encontrado." };
  return level.validate(submission, context, variant);
}

export function generateLevelVariant(levelId: number, context: PlayerContext): LevelVariant | null {
  const level = getLevel(levelId);
  if (!level) return null;
  return level.generateVariant(context);
}
