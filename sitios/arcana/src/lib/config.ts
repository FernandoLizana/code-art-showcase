import { z } from "zod";
import { FORBIDDEN_COORDINATE_LABELS, GAME } from "@/lib/game/constants";

export { GAME, FORBIDDEN_COORDINATE_LABELS };

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
  ADMIN_PASSWORD_HASH: z.string().optional().default(""),
  GAME_NAME: z.string().default("ARCANA OBSCURA"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  FINAL_SAFE_COORDINATES: z.string().default("0.0,0.0"),
  FINAL_DESTINATION_LABEL: z
    .string()
    .default("Lugar ficticio — configurar antes del despliegue"),
  RATE_LIMIT_MAX_ATTEMPTS: z.coerce.number().default(10),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  DEV_MODE: z
    .string()
    .optional()
    .transform((v) => v === "true"),
  SKIP_PERSONALITY: z
    .string()
    .optional()
    .transform((v) => v === "true"),
});

function loadConfig() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Invalid environment configuration: ${parsed.error.message}`);
  }
  return parsed.data;
}

export const config = loadConfig();

export function validateFinalCoordinates(): void {
  const label = config.FINAL_DESTINATION_LABEL.toUpperCase();
  for (const forbidden of FORBIDDEN_COORDINATE_LABELS) {
    if (label.includes(forbidden)) {
      throw new Error(
        `FINAL_DESTINATION_LABEL contains forbidden term: ${forbidden}`,
      );
    }
  }
  const coords = config.FINAL_SAFE_COORDINATES.split(",").map((c) => parseFloat(c.trim()));
  if (coords.length !== 2 || coords.some((c) => isNaN(c))) {
    throw new Error("FINAL_SAFE_COORDINATES must be valid lat,lng");
  }
}
