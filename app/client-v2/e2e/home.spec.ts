import { test, expect, Page } from "@playwright/test";
import { randomProjectName } from "./utils.js";

test.beforeEach(async ({ page }) => {
  await page.goto("");
});

const addProjectNavigateHome = async (page: Page, name: string) => {
  await page.getByLabel("Create project").click();
  await page.getByLabel("Create", { exact: true }).click();
  await page.getByLabel("Select a Species").click();
  await page.getByLabel("Streptococcus pneumoniae").click();
  await page.getByLabel("Name").fill(name);
  await page.getByLabel("Create", { exact: true }).click();

  await expect(page.getByText(name)).toBeVisible();

  await page.getByRole("link", { name: "Beebop home" }).click();
  await expect(page.getByRole("link", { name: name })).toBeVisible();
};

test("can add new project from home screen", async ({ page }) => {
  const projectName = randomProjectName();

  await addProjectNavigateHome(page, projectName);

  await expect(page.getByText(projectName)).toBeVisible();
});

test("can delete project", async ({ page }) => {
  const projectName = randomProjectName();
  await addProjectNavigateHome(page, projectName);

  await page.getByLabel(`delete ${projectName}`).click();
  await page.getByLabel("Delete project", { exact: true }).click();
  await expect(page.getByText("Project deleted")).toBeVisible();
  await expect(page.getByRole("link", { name: projectName })).not.toBeVisible();
});

test("can edit project name", async ({ page }) => {
  const projectName = randomProjectName();
  const newProjectName = randomProjectName();
  await addProjectNavigateHome(page, projectName);

  await page.getByLabel("Row Edit").first().click();
  await page.getByRole("row", { name: "Save Edit Cancel Edit" }).getByRole("textbox").click();
  await page.getByRole("row", { name: "Save Edit Cancel Edit" }).getByRole("textbox").fill(newProjectName);
  await page.getByLabel("Save Edit").click();
  await expect(page.getByRole("link", { name: newProjectName })).toBeVisible();
});
