import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";

const TSX_FLAG = "--export-flask-under-tsx";
const __filename = fileURLToPath(import.meta.url);
const root = path.join(path.dirname(__filename), "..");

if (!process.argv.includes(TSX_FLAG)) {
  const npx = "npx";
  const tsconfig = path.join(root, "tsconfig.json");
  const result = spawnSync(
    npx,
    ["--yes", "tsx", "--tsconfig", tsconfig, __filename, TSX_FLAG],
    {
      cwd: root,
      env: process.env,
      stdio: "inherit",
      shell: process.platform === "win32",
    },
  );
  process.exit(result.status ?? 1);
}

loadEnv({ path: path.join(root, ".env") });
process.env.DATABASE_URL ??= "file:./dev.db";
process.env.SESSION_SECRET ??= "export-for-flask-local-dummy-secret-min32";

const dataDir = path.join(root, "flask", "game", "data");
mkdirSync(dataDir, { recursive: true });

const questionsPath = path.join(dataDir, "questions.json");
const levelsMetaPath = path.join(dataDir, "levels_meta.json");

const { PERSONALITY_QUESTIONS } = await import(
  "../src/lib/personality/questions.ts"
);
const { LEVEL_REGISTRY } = await import("../src/lib/levels/registry.ts");

const questions = PERSONALITY_QUESTIONS.map(({ id, text, options }) => ({
  id,
  text,
  options: options.map(({ text: optionText, scores }) => ({
    text: optionText,
    scores,
  })),
}));

const levelsMeta = LEVEL_REGISTRY.map(
  ({ id, title, act, mechanic, narrativeEntry, hints }) => ({
    id,
    title,
    act,
    mechanic,
    narrativeEntry,
    hints: hints.map(({ id: hintId, text: hintText }) => ({
      id: hintId,
      text: hintText,
    })),
  }),
);

writeFileSync(questionsPath, `${JSON.stringify(questions, null, 2)}\n`, "utf8");
writeFileSync(levelsMetaPath, `${JSON.stringify(levelsMeta, null, 2)}\n`, "utf8");

for (const p of [questionsPath, levelsMetaPath]) {
  if (!existsSync(p)) {
    console.error(`Expected file missing: ${p}`);
    process.exit(1);
  }
}

console.log("Exported:");
console.log(questionsPath);
console.log(levelsMetaPath);
console.log(`  questions: ${questions.length}`);
console.log(`  levels: ${levelsMeta.length}`);

