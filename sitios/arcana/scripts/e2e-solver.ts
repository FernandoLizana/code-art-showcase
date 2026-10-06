/**
 * Genera payloads válidos para E2E a partir de variant.params (solo tests).
 */
import type { LevelVariant, PlayerContext } from "../src/types/game.ts";
import { validateLevelSubmission } from "../src/lib/levels/registry.ts";

export function buildCandidatePayloads(
  levelId: number,
  variant: LevelVariant,
  ctx: PlayerContext,
): unknown[] {
  const p = variant.params;
  const uiType = String(p.uiType ?? "");
  const candidates: unknown[] = [];
  const personality = ctx.personality;
  const words = ctx.words ?? [];
  const narrative = ctx.narrative ?? {};

  if (p.inactiveMark != null) {
    candidates.push({ markIndex: p.inactiveMark, clickCount: 1 });
  }
  if (p.missingCardId != null) {
    candidates.push({ cardId: p.missingCardId, cardName: p.missingCardName });
    candidates.push({ cardId: String(p.missingCardId) });
  }
  if (p.correctCardId != null) {
    candidates.push({ cardId: p.correctCardId });
  }
  if (p.correctIndex != null) {
    candidates.push({ optionIndex: p.correctIndex });
    candidates.push({ index: p.correctIndex });
  }
  if (p.correctId != null) {
    candidates.push({ choiceId: p.correctId });
  }
  if (p.correctChoice != null) {
    candidates.push({ choiceId: p.correctChoice });
    candidates.push({ choice: p.correctChoice });
  }
  if (p.correctAction != null) {
    candidates.push({ action: p.correctAction });
  }
  if (p.correctAnswer != null) {
    candidates.push({ answer: p.correctAnswer });
  }
  if (p.answer != null) {
    candidates.push({ answer: p.answer });
  }
  if (Array.isArray(p.acceptedAnswers)) {
    for (const a of p.acceptedAnswers as string[]) {
      candidates.push({ answer: a });
    }
  }
  if (p.reversedName != null) candidates.push({ answer: p.reversedName });
  if (p.pattern != null) candidates.push({ answer: p.pattern });
  if (p.hiddenText != null) candidates.push({ answer: p.hiddenText });
  if (p.entityName != null) {
    candidates.push({ answer: p.entityName });
    candidates.push({ name: p.entityName });
  }
  if (p.expectedOrder != null) candidates.push({ order: p.expectedOrder });
  if (p.sequence != null) {
    candidates.push({ sequence: p.sequence });
    candidates.push({ answer: p.sequenceJoined ?? p.sequence });
  }
  if (p.validPairs != null) candidates.push({ pairs: p.validPairs });
  if (p.correctAlignment != null) candidates.push({ alignment: p.correctAlignment });
  if (p.correctMemory != null) candidates.push({ memory: p.correctMemory });
  if (p.correctDirection != null) candidates.push({ direction: p.correctDirection });
  if (p.correctSymbol != null) {
    candidates.push({ symbol: p.correctSymbol });
    candidates.push({ choiceId: p.correctSymbol });
  }
  if (p.correctWitness != null) candidates.push({ witness: p.correctWitness });
  if (p.shadowId != null) candidates.push({ shadowId: p.shadowId });
  if (p.solution != null) {
    candidates.push({ answer: p.solution });
    candidates.push(p.solution);
  }
  if (p.expectedCoordinates != null) {
    candidates.push({ coordinates: p.expectedCoordinates });
  }

  if (personality?.borrowedName) candidates.push({ answer: personality.borrowedName });
  if (narrative.borrowedName) candidates.push({ answer: narrative.borrowedName as string });
  for (const w of words) candidates.push({ answer: w });

  if (p.durationMs != null) {
    candidates.push({ waitedMs: p.durationMs, clickCount: 0 });
    candidates.push({ waitedMs: Number(p.durationMs) + 100, clickCount: 0 });
  }

  if (uiType === "empty_submit" || uiType === "blank_page") candidates.push({});
  if (uiType === "confirmation") {
    candidates.push({ confirmed: true });
    candidates.push({ confirmed: false });
  }
  if (uiType === "red_button") {
    candidates.push({ pressed: false });
    candidates.push({ pressed: true });
  }
  if (uiType === "balance_forces" || levelId === 6) candidates.push({ position: 50 });

  if (uiType === "final_destination" || levelId === 100) {
    const coords = p.expectedCoordinates ?? process.env.FINAL_SAFE_COORDINATES ?? "0.0,0.0";
    candidates.push({ coordinates: coords });
  }

  candidates.push({ answer: "" });
  candidates.push({});
  return candidates;
}

export function solveLevel(
  levelId: number,
  ctx: PlayerContext,
  variant: LevelVariant,
): unknown {
  const candidates = buildCandidatePayloads(levelId, variant, ctx);
  for (const payload of candidates) {
    const result = validateLevelSubmission(
      levelId,
      { type: "answer", payload },
      ctx,
      variant,
    );
    if (result.success) return payload;
  }
  throw new Error(`E2E: no se pudo resolver nivel ${levelId}`);
}
