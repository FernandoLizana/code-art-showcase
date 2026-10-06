import type { PersonalityDimension, DimensionScores } from "@/types/game";
import { PERSONALITY_DIMENSIONS } from "@/types/game";
import { ARCHETYPES, BORROWED_NAMES } from "./archetypes";
import { getContraryModifiers } from "./modifiers";
import { deriveSeed, seedToIndex } from "@/lib/security/hash";
import type { PersonalityProfile } from "@/types/game";
import type { PersonalityAnswer, PersonalityQuestion } from "./questions";
import { PERSONALITY_QUESTIONS } from "./questions";
import { GAME } from "@/lib/game/constants";

export function createEmptyScores(): DimensionScores {
  return Object.fromEntries(
    PERSONALITY_DIMENSIONS.map((d) => [d, 0]),
  ) as DimensionScores;
}

export function selectQuestions(seed: string, count?: number): PersonalityQuestion[] {
  const target =
    count ??
    GAME.personalityQuestionMin +
      (seedToIndex(seed, GAME.personalityQuestionMax - GAME.personalityQuestionMin + 1));

  const shuffled = [...PERSONALITY_QUESTIONS];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = seedToIndex(`${seed}:q${i}`, i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, target);
}

export function scoreAnswers(answers: PersonalityAnswer[]): DimensionScores {
  const scores = createEmptyScores();
  const questionMap = new Map(PERSONALITY_QUESTIONS.map((q) => [q.id, q]));

  for (const answer of answers) {
    const question = questionMap.get(answer.questionId);
    if (!question) continue;
    const option = question.options[answer.optionIndex];
    if (!option) continue;
    for (const [dim, value] of Object.entries(option.scores)) {
      scores[dim as PersonalityDimension] += value;
    }
  }
  return scores;
}

function findDominantAndAvoided(scores: DimensionScores): {
  dominant: PersonalityDimension;
  avoided: PersonalityDimension;
} {
  let dominant: PersonalityDimension = PERSONALITY_DIMENSIONS[0];
  let avoided: PersonalityDimension = PERSONALITY_DIMENSIONS[0];
  let maxScore = -Infinity;
  let minScore = Infinity;

  for (const dim of PERSONALITY_DIMENSIONS) {
    if (scores[dim] > maxScore) {
      maxScore = scores[dim];
      dominant = dim;
    }
    if (scores[dim] < minScore) {
      minScore = scores[dim];
      avoided = dim;
    }
  }
  return { dominant, avoided };
}

function matchArchetype(scores: DimensionScores): { primary: string; secondary: string } {
  const ranked = ARCHETYPES.map((arch) => {
    const match = arch.primaryDimensions.reduce(
      (sum, dim) => sum + scores[dim],
      0,
    );
    return { id: arch.id, match };
  }).sort((a, b) => b.match - a.match);

  return {
    primary: ranked[0]?.id ?? "equilibrista",
    secondary: ranked[1]?.id ?? "observador",
  };
}

export function buildPersonalityProfile(
  sessionSeed: string,
  answers: PersonalityAnswer[],
): PersonalityProfile {
  const scores = scoreAnswers(answers);
  const { dominant, avoided } = findDominantAndAvoided(scores);
  const { primary, secondary } = matchArchetype(scores);
  const primaryArch = ARCHETYPES.find((a) => a.id === primary)!;
  const gameSeed = deriveSeed(sessionSeed, primary, dominant);
  const contraryModifiers = getContraryModifiers(dominant, avoided);
  const borrowedName = BORROWED_NAMES[seedToIndex(gameSeed, BORROWED_NAMES.length)];

  return {
    scores,
    primaryArchetype: primaryArch.name,
    secondaryArchetype: ARCHETYPES.find((a) => a.id === secondary)?.name ?? "",
    dominantDimension: dominant,
    avoidedDimension: avoided,
    tarotCard: primaryArch.tarotCard,
    tarotCardId: primaryArch.tarotCardId,
    gameSeed,
    contraryModifiers,
    borrowedName,
  };
}

export function getArchetypeById(id: string) {
  return ARCHETYPES.find((a) => a.id === id);
}
