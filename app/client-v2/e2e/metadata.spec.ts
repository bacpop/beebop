import { test, expect } from "@playwright/test";

test("can navigate to metadata view and see map", async ({ page }) => {
  await page.goto("");
  await page.getByLabel("Species Metadata").locator("a").click();
  await expect(page.getByText("Please select a species to")).toBeVisible();

  await page.getByLabel("Select species to view").click();
  await page.getByLabel("Streptococcus pneumoniae").click();
  await expect(page.getByLabel("Interactive map displaying")).toBeVisible();
});
