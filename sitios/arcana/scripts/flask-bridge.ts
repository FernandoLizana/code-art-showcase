#!/usr/bin/env node
/**
 * Puente Flask ↔ motor de niveles TypeScript.
 * Uso: echo '{"action":"validate",...}' | npx tsx scripts/flask-bridge.ts
 */
import { generateLevelVariant, validateLevelSubmission, getLevel } from "../src/lib/levels/registry.ts";
import type { PlayerContext } from "../src/types/game.ts";
import { solveLevel } from "./e2e-solver.ts";

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString("utf8");
}

function buildContext(data: Record<string, unknown>): PlayerContext {
  return {
    sessionId: String(data.sessionId ?? ""),
    seed: String(data.seed ?? ""),
    personality: (data.personality as PlayerContext["personality"]) ?? null,
    currentLevel: Number(data.currentLevel ?? 0),
    completedLevels: (data.completedLevels as number[]) ?? [],
    narrative: (data.narrative as Record<string, unknown>) ?? {},
    cardsSeen: (data.cardsSeen as string[]) ?? [],
    symbols: (data.symbols as string[]) ?? [],
    words: (data.words as string[]) ?? [],
    levelVariants: (data.levelVariants as Record<number, unknown>) ?? {},
    hintsUsedTotal: Number(data.hintsUsedTotal ?? 0),
    attemptsTotal: Number(data.attemptsTotal ?? 0),
    entityState: (data.entityState as Record<string, unknown>) ?? {},
  };
}

async function main() {
  const raw = await readStdin();
  const input = JSON.parse(raw) as {
    action: "generate" | "validate" | "meta" | "solve";
    levelId: number;
    context?: Record<string, unknown>;
    payload?: unknown;
    variant?: unknown;
  };

  if (input.action === "meta") {
    const level = getLevel(input.levelId);
    if (!level) {
      console.log(JSON.stringify({ error: "not_found" }));
      return;
    }
    console.log(
      JSON.stringify({
        id: level.id,
        title: level.title,
        act: level.act,
        mechanic: level.mechanic,
        narrativeEntry: level.narrativeEntry,
        hints: level.hints,
      }),
    );
    return;
  }

  const ctx = buildContext(input.context ?? {});

  if (input.action === "generate") {
    const variant = generateLevelVariant(input.levelId, ctx);
    console.log(JSON.stringify({ variant }));
    return;
  }

  if (input.action === "validate") {
    const variant = input.variant ?? generateLevelVariant(input.levelId, ctx);
    const result = validateLevelSubmission(
      input.levelId,
      { type: "answer", payload: input.payload },
      ctx,
      variant!,
    );
    console.log(JSON.stringify({ result, variant }));
    return;
  }

  if (input.action === "solve") {
    const variant = generateLevelVariant(input.levelId, ctx);
    if (!variant) {
      console.log(JSON.stringify({ error: "no_variant" }));
      return;
    }
    const payload = solveLevel(input.levelId, ctx, variant);
    console.log(JSON.stringify({ payload, variant }));
    return;
  }

  console.log(JSON.stringify({ error: "unknown_action" }));
}

main().catch((e) => {
  console.error(JSON.stringify({ error: String(e) }));
  process.exit(1);
});
