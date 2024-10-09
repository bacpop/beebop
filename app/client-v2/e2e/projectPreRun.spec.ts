import { expect, test } from "@playwright/test";
import { createProject, randomProjectName, uploadFiles } from "./utils.js";

let projectName: string;
test.beforeEach(async ({ page }) => {
  await page.goto("");
  projectName = randomProjectName();
  await createProject(page, projectName);
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

test("can export project data as csv", async ({ page }) => {
  uploadFiles(page);

  const downloadPromise = page.waitForEvent("download");
  await page.getByLabel("Export").click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe(`${projectName}.csv`);
});
