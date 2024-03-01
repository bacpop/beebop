import { test, expect } from "@playwright/test";

// See here how to get started:
// https://playwright.dev/docs/intro
test("first test", async ({ page }) => {
  await page.goto("http://localhost:5173/login");

  await expect(page.getByText("Welcome to Beebop")).toBeVisible();
});
