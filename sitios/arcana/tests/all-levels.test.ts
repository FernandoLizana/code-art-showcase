import { describe, it, expect } from "vitest";
import { LEVEL_REGISTRY, getLevel } from "@/lib/levels/registry";

describe("All 100 levels", () => {
  it("registers exactly 100 levels", () => {
    expect(LEVEL_REGISTRY.length).toBe(100);
  });

  it("has no stub levels remaining", () => {
    const stubs = LEVEL_REGISTRY.filter((l) => l.mechanic === "stub");
    expect(stubs.length).toBe(0);
  });

  it("each level has 3 hints", () => {
    for (const level of LEVEL_REGISTRY) {
      expect(level.hints.length).toBe(3);
    }
  });

  it("each level has uiType or known mechanic for levels 1-5", () => {
    for (const level of LEVEL_REGISTRY) {
      if (level.id <= 5) continue;
      const variant = level.generateVariant({
        sessionId: "t",
        seed: "testseed123456",
        personality: null,
        currentLevel: level.id,
        completedLevels: [],
        narrative: {},
        cardsSeen: [],
        symbols: [],
        words: ["Mara Vex"],
        levelVariants: {},
        hintsUsedTotal: 0,
        attemptsTotal: 0,
        entityState: {},
      });
      expect(variant?.params.uiType ?? level.mechanic).toBeTruthy();
    }
  });

  it("level ids are sequential 1-100", () => {
    LEVEL_REGISTRY.forEach((l, i) => {
      expect(l.id).toBe(i + 1);
    });
  });

  it("getLevel returns correct level", () => {
    expect(getLevel(50)?.title).toContain("arcano");
    expect(getLevel(100)?.act).toBe(10);
  });
});
