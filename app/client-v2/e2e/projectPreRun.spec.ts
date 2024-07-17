import { expect, test } from "@playwright/test";
import { randomProjectName, uploadFiles } from "./utils.js";

test.beforeEach(async ({ page }) => {
  await page.goto("");
  await page.getByPlaceholder("Create new Project").fill(randomProjectName());
  await page.getByPlaceholder("Create new Project").press("Enter");
});

test("upload multiple files and display amr information", async ({ page }) => {
  uploadFiles(page);

  await expect(page.getByText("Sketching and calculating AMR")).toBeVisible();
  await expect(page.getByRole("progressbar")).toBeVisible();

  await expect(page.getByText("good_1.fa")).toBeVisible();
  await expect(page.getByText("good_2.fa")).toBeVisible();
  await expect(page.getByRole("cell", { name: "P C E Te Sxt" })).toHaveCount(2);

  await expect(page.getByRole("progressbar")).not.toBeVisible();
});

test("can delete file samples from project", async ({ page }) => {
  uploadFiles(page);

  await page.getByLabel("Remove good_1").click();
  await expect(page.getByText("good_1.fa")).not.toBeVisible();
});

test("shows progress bar whilst uploading files & gone after full uploaded", async ({ page }) => {
  uploadFiles(page);

  await expect(page.getByRole("progressbar")).toBeVisible();

  await expect(page.getByText("good_1.fa")).toBeVisible();

  await expect(page.getByRole("progressbar")).not.toBeVisible();
});
