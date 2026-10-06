import type { LevelDefinition, LevelVariant, PlayerContext, PersonalityModifier } from "@/types/game";
import { deriveSeed, seedToIndex } from "@/lib/security/hash";
import { selectLevelModifier } from "@/lib/personality/modifiers";

export const DEFAULT_ACCESSIBILITY = {
  keyboardAlternative: true,
  visualAudioAlternative: true,
  colorBlindMode: true,
  reducedMotionSafe: true,
} as const;

export function baseVariant(
  context: PlayerContext,
  levelId: number,
  supported: PersonalityModifier[],
): LevelVariant {
  const levelSeed = deriveSeed(context.seed, levelId, context.personality?.gameSeed ?? "");
  const modifier = context.personality
    ? selectLevelModifier(supported, context.personality.contraryModifiers, levelSeed)
    : supported[0];

  return { modifier, params: { levelSeed } };
}

export function getDominantScore(
  context: PlayerContext,
  dimension: keyof NonNullable<PlayerContext["personality"]>["scores"],
): number {
  return context.personality?.scores[dimension] ?? 0;
}

export function isHighTrait(context: PlayerContext, dimension: keyof NonNullable<PlayerContext["personality"]>["scores"], threshold = 8): boolean {
  return getDominantScore(context, dimension) >= threshold;
}

export function levelDef(
  partial: Omit<LevelDefinition, "accessibilityMode"> & Partial<Pick<LevelDefinition, "accessibilityMode">>,
): LevelDefinition {
  return {
    accessibilityMode: DEFAULT_ACCESSIBILITY,
    ...partial,
  };
}

/** Keys never sent to the client */
export const SENSITIVE_PARAM_KEYS = new Set([
  "answer",
  "acceptedAnswers",
  "missingCardId",
  "missingCardName",
  "sequence",
  "sequenceJoined",
  "inactiveMark",
  "correctIndex",
  "correctId",
  "correctAnswer",
  "correctChoice",
  "correctAction",
  "expectedOrder",
  "shadowId",
  "wrongIndex",
  "solution",
  "validPairs",
  "reversedName",
  "pattern",
  "correctCardId",
  "correctWord",
  "entityName",
  "missingArcanaId",
  "expectedCoordinates",
  "rejectedAnswer",
  "omitStep",
  "correctSymbol",
  "correctWitness",
  "hiddenText",
  "hiddenLetter",
  "fakeHelper",
]);

export function sanitizeVariantParams(params: Record<string, unknown>): Record<string, unknown> {
  const safe = { ...params };
  for (const key of SENSITIVE_PARAM_KEYS) {
    delete safe[key];
  }
  return safe;
}
