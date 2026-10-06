export const GAME = {
  name: process.env.GAME_NAME ?? "ARCANA OBSCURA",
  totalLevels: 100,
  actsCount: 10,
  levelsPerAct: 10,
  personalityQuestionMin: 20,
  personalityQuestionMax: 30,
  minWaitSeconds: 5,
  maxWaitSeconds: 120,
  cookieName: "arcana_session",
  recoveryCodeLength: 12,
} as const;

export const FORBIDDEN_COORDINATE_LABELS = [
  "HOME",
  "CASA",
  "DOMICILIO",
  "PRIVATE",
  "RESIDENTIAL",
  "PERSONAL",
] as const;
