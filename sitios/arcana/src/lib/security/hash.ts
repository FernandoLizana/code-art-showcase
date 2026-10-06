import { createHash } from "crypto";
import { seedToIndex as sharedSeedToIndex } from "./seed";

export function hashSubmission(value: string): string {
  return createHash("sha256").update(value.toLowerCase().trim()).digest("hex");
}

export function generateSeed(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function deriveSeed(baseSeed: string, ...parts: (string | number)[]): string {
  const input = [baseSeed, ...parts.map(String)].join(":");
  return createHash("sha256").update(input).digest("hex").slice(0, 16);
}

export { sharedSeedToIndex as seedToIndex };
