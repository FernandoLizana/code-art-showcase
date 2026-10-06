import type { PlayerContext, PersonalityProfile } from "@/types/game";
import { db } from "@/lib/db";

export async function buildPlayerContext(
  sessionId: string,
  seed: string,
): Promise<PlayerContext | null> {
  const session = await db.gameSession.findUnique({
    where: { id: sessionId },
  });
  if (!session) return null;

  let personality: PersonalityProfile | null = null;
  if (session.personalityJson) {
    personality = JSON.parse(session.personalityJson) as PersonalityProfile;
  }

  return {
    sessionId,
    seed,
    personality,
    currentLevel: session.currentLevel,
    completedLevels: JSON.parse(session.completedLevels) as number[],
    narrative: JSON.parse(session.narrativeJson) as Record<string, unknown>,
    cardsSeen: JSON.parse(session.cardsSeenJson) as string[],
    symbols: JSON.parse(session.symbolsJson) as string[],
    words: JSON.parse(session.wordsJson) as string[],
    levelVariants: JSON.parse(session.levelVariantsJson) as Record<number, unknown>,
    hintsUsedTotal: session.totalHintsUsed,
    attemptsTotal: session.totalAttempts,
    entityState: JSON.parse(session.entityState) as Record<string, unknown>,
  };
}

export async function updateSessionProgress(
  sessionId: string,
  updates: {
    currentLevel?: number;
    completedLevels?: number[];
    narrative?: Record<string, unknown>;
    cardsSeen?: string[];
    symbols?: string[];
    words?: string[];
    levelVariants?: Record<number, unknown>;
    entityState?: Record<string, unknown>;
    personality?: PersonalityProfile;
  },
): Promise<void> {
  const data: Record<string, unknown> = {};

  if (updates.currentLevel !== undefined) data.currentLevel = updates.currentLevel;
  if (updates.completedLevels !== undefined)
    data.completedLevels = JSON.stringify(updates.completedLevels);
  if (updates.narrative !== undefined)
    data.narrativeJson = JSON.stringify(updates.narrative);
  if (updates.cardsSeen !== undefined)
    data.cardsSeenJson = JSON.stringify(updates.cardsSeen);
  if (updates.symbols !== undefined) data.symbolsJson = JSON.stringify(updates.symbols);
  if (updates.words !== undefined) data.wordsJson = JSON.stringify(updates.words);
  if (updates.levelVariants !== undefined)
    data.levelVariantsJson = JSON.stringify(updates.levelVariants);
  if (updates.entityState !== undefined)
    data.entityState = JSON.stringify(updates.entityState);
  if (updates.personality !== undefined)
    data.personalityJson = JSON.stringify(updates.personality);

  await db.gameSession.update({ where: { id: sessionId }, data });
}

export function canAccessLevel(context: PlayerContext, levelId: number): boolean {
  if (levelId === 1) return true;
  if (context.completedLevels.includes(levelId - 1)) return true;
  if (context.completedLevels.includes(levelId)) return true;
  return false;
}

export function getActForLevel(levelId: number): number {
  return Math.ceil(levelId / 10);
}
