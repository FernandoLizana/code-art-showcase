import { describe, it, expect } from "vitest";
import { validateFinalCoordinates, FORBIDDEN_COORDINATE_LABELS } from "@/lib/config";

describe("Security", () => {
  it("defines forbidden coordinate labels", () => {
    expect(FORBIDDEN_COORDINATE_LABELS).toContain("HOME");
    expect(FORBIDDEN_COORDINATE_LABELS).toContain("CASA");
  });

  it("validates safe coordinates format", () => {
    expect(() => validateFinalCoordinates()).not.toThrow();
  });
});

import { checkRateLimit, resetRateLimit } from "@/lib/security/rate-limit";

describe("Rate limiting", () => {
  it("allows requests under limit", () => {
    resetRateLimit("test-key");
    const result = checkRateLimit("test-key");
    expect(result.allowed).toBe(true);
  });

  it("blocks after max attempts", () => {
    const key = "block-test-key";
    resetRateLimit(key);
    for (let i = 0; i < 10; i++) {
      checkRateLimit(key);
    }
    const result = checkRateLimit(key);
    expect(result.allowed).toBe(false);
  });
});
