import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120000,
    env: {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL ?? "file:./dev.db",
      SESSION_SECRET: process.env.SESSION_SECRET ?? "arcana-obscura-dev-secret-key-32chars-minimum-length",
    } as Record<string, string>,
  },
});
