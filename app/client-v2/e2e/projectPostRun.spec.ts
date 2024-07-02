import { expect, test } from "@playwright/test";
import { randomProjectName, uploadFiles } from "./utils.js";

test.describe.configure({ mode: "parallel", timeout: 180000 });
test.slow();
let projectName: string;
test.beforeEach(async ({ page }) => {
  await page.goto("");
  projectName = randomProjectName();
  await page.getByPlaceholder("Create new Project").fill(projectName);
  await page.getByPlaceholder("Create new Project").press("Enter");
});

test("can run project and view results", async ({ page }) => {
  uploadFiles(page, ["e2e/fastaFiles/good_1.fa"]);
  await page.getByLabel("Run Analysis").click();

  await expect(page.getByText("Running Analysis...33%")).toBeVisible({ timeout: 90000 });
  await expect(page.getByText("Running Analysis...67%")).toBeVisible({ timeout: 90000 });

  await expect(page.locator("span").filter({ hasText: "Completed" }).first()).toBeVisible({ timeout: 90000 });
  await expect(page.getByLabel("Visit")).toBeVisible();
  await expect(page.getByLabel("Download microreact zip")).toBeVisible();
  await expect(page.getByLabel("Download network zip")).toBeVisible();
  await expect(page.getByText("GPSC7")).toBeVisible();

  await page.getByRole("tab", { name: "Network" }).click();
  await expect(page.getByText("Cluster: GPSC7")).toBeVisible();
  await expect(page.getByLabel("Fullscreen").first()).toBeVisible();
  await expect(page.getByLabel("Reset Layout").first()).toBeVisible();
});

test("can download network, microreact and visit opens microreact popup with link to get token", async ({ page }) => {
  uploadFiles(page, ["e2e/fastaFiles/good_1.fa"]);
  await page.getByLabel("Run Analysis").click();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("row", { name: "good_1" }).getByLabel("Download network zip").click();
  await downloadPromise;
  const download1Promise = page.waitForEvent("download");
  await page.getByRole("row", { name: "good_1" }).getByLabel("Download microreact zip").click();
  await download1Promise;

  await page.getByRole("row", { name: "good_1" }).getByLabel("Visit").click();
  await expect(page.getByText("Submit Microreact Token")).toBeVisible();
  await page.getByLabel("Cancel").click();
  await page.getByLabel("Microreact settings").click();

  await page.getByRole("link", { name: "Microreact Account Settings" }).click();
  const page1Promise = page.waitForEvent("popup");
  await page.getByRole("link", { name: "Microreact Account Settings" }).click();
  const page1 = await page1Promise;
  expect(page1.url().includes("microreact.org")).toBeTruthy();
});

test("bad samples after run displays failed chips", async ({ page }) => {
  uploadFiles(page, ["e2e/fastaFiles/bad_1.fasta"]);
  await page.getByLabel("Run Analysis").click();

  await expect(page.getByRole("cell", { name: "failed" })).toHaveCount(3, { timeout: 90000 });
  await page.locator("td:nth-child(4) > .p-tag").first().hover();
  await expect(page.getByText("Invalid Sample")).toBeVisible();
});

test("can load up already run project even if loading", async ({ page }) => {
  uploadFiles(page, ["e2e/fastaFiles/good_1.fa"]);
  await page.getByLabel("Run Analysis").click();
  await page.getByRole("link", { name: "Beebop home" }).click();
  await page.getByRole("link", { name: projectName }).click();

  await expect(page.getByText("Running Analysis...33%")).toBeVisible({ timeout: 90000 });
  await expect(page.getByText("Running Analysis...67%")).toBeVisible({ timeout: 90000 });
  await expect(page.locator("span").filter({ hasText: "Completed" }).first()).toBeVisible({ timeout: 90000 });
  await expect(page.getByLabel("Visit")).toBeVisible();
  await expect(page.getByLabel("Download microreact zip")).toBeVisible();
  await expect(page.getByLabel("Download network zip")).toBeVisible();
  await expect(page.getByText("GPSC7")).toBeVisible();
});
