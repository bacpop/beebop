import { test, expect, Page } from "@playwright/test";
import { randomProjectName } from "./utils.js";

test.beforeEach(async ({ page }) => {
  await page.goto("");
});

const addProjectNavigateHome = async (page: Page, name: string) => {
  await page.getByPlaceholder("Create new Project").fill(name);
  await page.getByPlaceholder("Create new Project").press("Enter");
  await expect(page.getByText(name)).toBeVisible();

  await page.getByRole("link", { name: "Beebop home" }).click();
  await expect(page.getByRole("link", { name: name })).toBeVisible();
};

test("can add new project from home screen and cannot create duplicate name", async ({ page }) => {
  const projectName = randomProjectName();
  await addProjectNavigateHome(page, projectName);

  await page.getByPlaceholder("Create new Project").fill(projectName);
  await page.getByPlaceholder("Create new Project").press("Enter");
  await expect(page.getByText("Project name already exists or is empty")).toBeVisible();
});

test("can not add project with an empty name", async ({ page }) => {
  await page.getByPlaceholder("Create new Project").fill("");
  await page.getByPlaceholder("Create new Project").press("Enter");
  await expect(page.getByText("Project name already exists or is empty")).toBeVisible();
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
  await page.getByRole("row", { name: "Save Edit Cancel Edit 0" }).getByRole("textbox").click();
  await page.getByRole("row", { name: "Save Edit Cancel Edit 0" }).getByRole("textbox").fill(newProjectName);
  await page.getByLabel("Save Edit").click();
  await expect(page.getByRole("link", { name: newProjectName })).toBeVisible();
});
