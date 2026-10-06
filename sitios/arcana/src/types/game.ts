export const PERSONALITY_DIMENSIONS = [
  "picardia",
  "bondad",
  "dominancia",
  "sumision",
  "impulsividad",
  "paciencia",
  "pensamiento_logico",
  "pensamiento_intuitivo",
  "escepticismo",
  "apertura_simbolica",
  "curiosidad",
  "prudencia",
  "empatia",
  "individualismo",
  "perfeccionismo",
  "tolerancia_ambiguedad",
  "necesidad_control",
  "capacidad_renuncia",
] as const;

export type PersonalityDimension = (typeof PERSONALITY_DIMENSIONS)[number];

export type DimensionScores = Record<PersonalityDimension, number>;

export interface PersonalityProfile {
  scores: DimensionScores;
  primaryArchetype: string;
  secondaryArchetype: string;
  dominantDimension: PersonalityDimension;
  avoidedDimension: PersonalityDimension;
  tarotCard: string;
  tarotCardId: number;
  gameSeed: string;
  contraryModifiers: PersonalityModifier[];
  borrowedName: string;
}

export type PersonalityModifier =
  | "require_patience"
  | "require_quick_action"
  | "reward_honesty"
  | "require_boundaries"
  | "reduce_control"
  | "require_initiative"
  | "favor_logic"
  | "favor_intuition"
  | "resist_curiosity"
  | "accept_incompleteness";

export interface PlayerContext {
  sessionId: string;
  seed: string;
  personality: PersonalityProfile | null;
  currentLevel: number;
  completedLevels: number[];
  narrative: Record<string, unknown>;
  cardsSeen: string[];
  symbols: string[];
  words: string[];
  levelVariants: Record<number, unknown>;
  hintsUsedTotal: number;
  attemptsTotal: number;
  entityState: Record<string, unknown>;
}

export interface LevelVariant {
  modifier: PersonalityModifier;
  params: Record<string, unknown>;
  narrativeOverride?: string;
}

export interface LevelSubmission {
  type: string;
  payload: unknown;
}

export interface ValidationResult {
  success: boolean;
  message?: string;
  consequences?: ConsequenceDefinition[];
}

export interface ConsequenceDefinition {
  key: string;
  value: unknown;
}

export interface HintDefinition {
  id: number;
  text: string;
}

export interface AccessibilityDefinition {
  keyboardAlternative: boolean;
  visualAudioAlternative: boolean;
  colorBlindMode: boolean;
  reducedMotionSafe: boolean;
}

export interface LevelDefinition {
  id: number;
  title: string;
  act: number;
  archetypeTags: string[];
  mechanic: string;
  narrativeEntry: string;
  supportedModifiers: PersonalityModifier[];
  generateVariant: (context: PlayerContext) => LevelVariant;
  validate: (
    submission: LevelSubmission,
    context: PlayerContext,
    variant: LevelVariant,
  ) => ValidationResult;
  hints: HintDefinition[];
  accessibilityMode: AccessibilityDefinition;
  consequences?: ConsequenceDefinition[];
}

export interface SessionTokenPayload {
  sessionId: string;
  seed: string;
  iat: number;
  exp: number;
}
