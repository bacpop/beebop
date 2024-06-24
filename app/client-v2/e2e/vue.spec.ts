import { test, expect } from "@playwright/test";

test("first test", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByText("Welcome to Beebop")).toBeVisible();
});
