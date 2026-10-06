import { test, expect } from "@playwright/test";

test.describe("ARCANA OBSCURA flow", () => {
  test("home page loads with entry link", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Este archivo no fue construido para ti")).toBeVisible();
    await expect(page.getByRole("link", { name: "Entrar" })).toBeVisible();
  });

  test("advertencia creates session", async ({ page }) => {
    await page.goto("/advertencia");
    await page.getByRole("button", { name: "Comprendo" }).click();
    await page.waitForURL("**/prueba", { timeout: 15000 });
    await expect(page.getByText(/\d+ \/ \d+/)).toBeVisible();
  });

  test("accessibility config page", async ({ page }) => {
    await page.goto("/configuracion");
    await expect(page.getByText("Configuración")).toBeVisible();
  });
});
