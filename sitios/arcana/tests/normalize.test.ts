import { describe, it, expect } from "vitest";
import {
  normalizeAnswer,
  answersMatch,
  matchesAnyVariant,
} from "@/lib/game/normalize";

describe("Answer normalization", () => {
  it("ignores case, accents, and articles", () => {
    expect(normalizeAnswer("La Emperatriz")).toBe("emperatriz");
    expect(normalizeAnswer("  EMPERATRIZ  ")).toBe("emperatriz");
  });

  it("matches answers with variants", () => {
    expect(answersMatch("emperatriz", "La Emperatriz")).toBe(true);
    expect(matchesAnyVariant("III", ["La Emperatriz", "III", "Arcano III"])).toBe(true);
  });

  it("rejects incorrect answers", () => {
    expect(answersMatch("El Mago", "La Emperatriz")).toBe(false);
  });
});
