import { describe, it, expect } from "vitest";
import { seedToIndex, deriveSequenceFromSeed } from "@/lib/security/seed";
import { deriveSeed } from "@/lib/security/hash";
import {
  generateLevelVariant,
  validateLevelSubmission,
  getLevel,
  LEVEL_REGISTRY,
} from "@/lib/levels/registry";
import type { PlayerContext, PersonalityProfile } from "@/types/game";
import { PERSONALITY_DIMENSIONS } from "@/types/game";

function mockContext(overrides: Partial<PlayerContext> = {}): PlayerContext {
  const scores = Object.fromEntries(PERSONALITY_DIMENSIONS.map((d) => [d, 5])) as PersonalityProfile["scores"];
  const personality: PersonalityProfile = {
    scores,
    primaryArchetype: "El Observador",
    secondaryArchetype: "El Analista",
    dominantDimension: "paciencia",
    avoidedDimension: "impulsividad",
    tarotCard: "La Sacerdotisa",
    tarotCardId: 2,
    gameSeed: deriveSeed("test", "observador", "paciencia"),
    contraryModifiers: ["require_quick_action", "require_patience"],
    borrowedName: "Mara Vex",
  };

  return {
    sessionId: "test-session",
    seed: "testseed123456",
    personality,
    currentLevel: 1,
    completedLevels: [],
    narrative: {},
    cardsSeen: [],
    symbols: [],
    words: [],
    levelVariants: {},
    hintsUsedTotal: 0,
    attemptsTotal: 0,
    entityState: {},
    ...overrides,
  };
}

describe("Level Registry", () => {
  it("has 100 levels registered", () => {
    expect(LEVEL_REGISTRY.length).toBe(100);
  });

  it("generates deterministic variants", () => {
    const ctx = mockContext();
    const v1 = generateLevelVariant(1, ctx);
    const v2 = generateLevelVariant(1, ctx);
    expect(v1?.params.inactiveMark).toBe(v2?.params.inactiveMark);
  });

  it("validates level 1 correct mark", () => {
    const ctx = mockContext();
    const variant = generateLevelVariant(1, ctx)!;
    const inactiveMark = variant.params.inactiveMark as number;
    const result = validateLevelSubmission(
      1,
      { type: "answer", payload: { markIndex: inactiveMark, clickCount: 1 } },
      ctx,
      variant,
    );
    expect(result.success).toBe(true);
  });

  it("rejects level 1 wrong mark", () => {
    const ctx = mockContext();
    const variant = generateLevelVariant(1, ctx)!;
    const inactiveMark = variant.params.inactiveMark as number;
    const wrongMark = (inactiveMark + 1) % 7;
    const result = validateLevelSubmission(
      1,
      { type: "answer", payload: { markIndex: wrongMark, clickCount: 1 } },
      ctx,
      variant,
    );
    expect(result.success).toBe(false);
  });

  it("validates level 3 accepted answers from variant", () => {
    const ctx = mockContext();
    const variant = generateLevelVariant(3, ctx)!;
    const accepted = variant.params.acceptedAnswers as string[];
    for (const ans of accepted) {
      const result = validateLevelSubmission(
        3,
        { type: "answer", payload: { answer: ans } },
        ctx,
        variant,
      );
      expect(result.success).toBe(true);
    }
  });

  it("validates level 2 missing card", () => {
    const ctx = mockContext();
    const variant = generateLevelVariant(2, ctx)!;
    const result = validateLevelSubmission(
      2,
      {
        type: "answer",
        payload: {
          cardId: variant.params.missingCardId,
          cardName: variant.params.missingCardName,
        },
      },
      ctx,
      variant,
    );
    expect(result.success).toBe(true);
  });
});

describe("Seed determinism", () => {
  it("produces consistent indices", () => {
    expect(seedToIndex("test", 7)).toBe(seedToIndex("test", 7));
  });

  it("produces consistent sequences", () => {
    const pool = ["A", "B", "C"];
    const s1 = deriveSequenceFromSeed("seed1", 4, pool);
    const s2 = deriveSequenceFromSeed("seed1", 4, pool);
    expect(s1).toEqual(s2);
  });
});

describe("Level definitions", () => {
  it("levels 1-5 are not stubs", () => {
    for (let i = 1; i <= 5; i++) {
      const level = getLevel(i)!;
      expect(level.mechanic).not.toBe("stub");
      expect(level.hints.length).toBe(3);
    }
  });
});
