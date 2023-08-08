/// <reference lib="dom"/>
/* eslint-disable no-tabs */

import { test, expect, Page } from "@playwright/test";
import { readFileSync } from "fs";
import config from "../../src/settings/development/config";
import PlaywrightConfig from "../../playwright.config";

const createProject = async (projectName: string, page: Page) => {
    await page.fill("input#create-project-name", projectName);
    await page.click("button#create-project-btn");
    expect(await page.locator("#no-results").innerText()).toBe("No data uploaded yet");
};

const expectDownloadButtons = async (fileName: string, page: Page) => {
    await expect(page.locator(`tr:has-text("${fileName}") .btn`).nth(0)).toContainText("Download zip file");
    await expect(page.locator(`tr:has-text("${fileName}") .btn`).nth(1)).toContainText("Generate Microreact URL");
    await expect(page.locator(`tr:has-text("${fileName}") .btn`).nth(2)).toContainText("Download zip file");
};

test.describe("Logged in Tests", () => {
    const { timeout } = PlaywrightConfig;

    test.beforeEach(async ({ page }) => {
        await page.goto(`${config.serverUrl()}/login/mock`);
        await page.goto(config.clientUrl());
    });

    test("should display Logout in dropdown menu", async ({ page }) => {
        await page.click(".bi-three-dots-vertical");
        await expect(page.locator(".dropdown-menu")).toContainText("Logout");
    });

    test("should display Login buttons after Logging out", async ({ page }) => {
        await page.click(".bi-three-dots-vertical");
        await page.click("text=Logout");
        await expect(page.locator(".auth")).toContainText("Login");
    });

    test("should display dropzone in Project view", async ({ page }) => {
        await createProject("test project", page);
        await expect(page.locator(".dropzone")).toBeVisible();
        await expect(page.locator("h4")).toContainText("test project");
    });

    test("should redirect from project page to home page if name has not been provided", async ({ page }) => {
        await page.goto(`${config.clientUrl()}/project`);
        await expect(await page.locator("button#create-project-btn")).toBeVisible();
    });

    test("should behave as expected when doing full project analysis, then new project", async ({ page }) => {
        await createProject("test project", page);
        // Read files into a buffer
        const buffer = readFileSync("./tests/files/6930_8_13.fa", { encoding: "utf8", flag: "r" });
        const buffer2 = readFileSync("./tests/files/6930_8_11.fa", { encoding: "utf8", flag: "r" });
        // Create the DataTransfer and add Files
        const dataTransfer = await page.evaluateHandle(
            ({ data, data2 }) => {
                const dt = new DataTransfer();
                const file = new File([data.toString()], "6930_8_13.fa", { type: "text/plain" });
                const file2 = new File([data2.toString()], "6930_8_11.fa", { type: "text/plain" });
                dt.items.add(file);
                dt.items.add(file2);
                return dt;
            },
            {
                data: buffer,
                data2: buffer2
            }
        );
        // Dropping files to dropzone
        await page.dispatchEvent(".dropzone", "drop", { dataTransfer });
        // Expect count of files to be 2
        await expect(page.locator(".count")).toContainText("2");
        // Expect table to appear
        await expect(page.locator("table")).toHaveCount(1);
        // Expect files, hashes, AMR and Sketch appearing in table
        await page.waitForTimeout(10000);
        await expect(page.locator('tr:has-text("6930_8_13.fa")')).toContainText(["6930_8_13.fa", "✔", "PCETE SXT"]);
        await expect(page.locator('tr:has-text("6930_8_11.fa")')).toContainText(["6930_8_11.fa", "✔", "PCETE SXT"]);
        // expect to have a 'start analysis' button
        await expect(page.locator(".start-analysis")).toContainText("Start Analysis");
        // Expect to see ProgressBar once button was pressed
        await page.click("text=Start Analysis");
        await expect(page.locator(".progress-bar")).toHaveCount(1);
        // Expect all jobs to finish
        await page.waitForTimeout(20000);
        await expect(page.locator(".progress-bar")).toContainText("100.00%");
        // Expect clusters appearing in table
        await expect(page.locator('tr:has-text("6930_8_13.fa")'))
            .toContainText(["6930_8_13.fa", "✔", "PCETE SXT", "7"]);
        await expect(page.locator('tr:has-text("6930_8_11.fa")'))
            .toContainText(["6930_8_11.fa", "✔", "PCETE SXT", "24"]);
        // Expect download buttons and button to generate microreact URL to appear
        await expectDownloadButtons("6930_8_13.fa", page);

        // on clicking Generate Microreact URL button, modal appears
        await page.click("text=Generate Microreact URL");
        await expect(page.locator(".modalFlex")).toContainText("No token submitted yet");
        await expect(page.locator(".modalFlex .btn")).toContainText("Save token");
        // after submitting microreact token, button turns into link to microreact.org
        await page.locator("input").fill(process.env.MICROREACT_TOKEN as string);
        await page.click("text=Save token");
        await expect(page.locator('tr:has-text("6930_8_13.fa") a')).toContainText("Visit Microreact URL");
        await expect(page.locator('tr:has-text("6930_8_13.fa") a'))
            .toHaveAttribute("href", /https:\/\/microreact.org\/project\/.*-poppunk.*/);
        // network visualisation component has 1 button for each cluster (=2) and renders canvases
        await page.click(".nav-link >> text=Network");
        await expect(page.locator("#cluster-tabs")).toHaveCount(2);
        await expect(page.locator("#cy")).toHaveCount(1);
        await expect(page.locator("#cy canvas")).toHaveCount(3);
        // can browse back to Home page and see new project in history
        await page.goto(config.clientUrl());
        await expect(await page.locator(".saved-project-row .saved-project-name").first())
            .toHaveText("test project", { timeout });
        expect(await (await page.locator(".saved-project-row .saved-project-date").first()).innerText())
            .toMatch(/^[0-3][0-9]\/[0-1][0-9]\/20[2-9][0-9] [0-2][0-9]:[0-5][0-9]$/);
        const lastProjectIndex = await page.locator(".saved-project-row").count();
        // can create a new empty project
        await createProject("another test project", page);
        // can browse back to Home page and load previous project
        await page.goto(config.clientUrl());
        await page.click(":nth-match(.saved-project-row button, 2)");
        await expect(page.locator(":nth-match(.tab-content tr, 1)"))
            .toContainText(["6930_8_13.fa", "✔", "PCETE SXT"], { timeout });
        await expect(page.locator(":nth-match(.tab-content tr, 2)"))
            .toContainText(["6930_8_11.fa", "✔", "PCETE SXT"]);
        await expectDownloadButtons("6930_8_13.fa", page);
    });

    test("can rename project", async ({ page }) => {
        // rename project in Project view
        await createProject("old project name", page);
        await page.click("h4 i");
        // should be prevented from saving empty project name
        await page.fill("h4 input", "");
        await expect(page.locator("#save-project-name")).not.toBeEnabled();
        await expect(page.locator(".message")).toHaveText("Name cannot be empty");
        const newProjectName = `new project name ${Date.now()}`;
        await page.fill("h4 input", newProjectName);
        await page.click("#save-project-name");
        await expect(page.locator("h4")).toHaveText(newProjectName, { timeout });

        // browse back to Home page and check project has been renamed
        await page.goto(config.clientUrl());
        expect(await page.innerText(":nth-match(.saved-project-row .saved-project-name, 1)"))
            .toBe(newProjectName);

        // rename project in Home view
        await page.click(".saved-project-name i");
        const anotherNewProjectName = `another new project name ${Date.now()}`;
        await page.fill(".saved-project-name input", anotherNewProjectName);
        await expect(page.locator("#save-project-name")).toBeEnabled();
        await page.click("#save-project-name");
        expect(await page.innerText(".saved-project-name")).toBe(anotherNewProjectName);
    });

    test("can only edit one project name at a time in Home page", async ({ page }) => {
        await createProject("name test 1", page);
        await page.goto(config.clientUrl());
        await createProject("name test 2", page);
        await page.goto(config.clientUrl());

        // Click edit icon for first project and confirm editing
        await page.click(":nth-match(.edit-project-name i, 1)");
        await expect(page.locator(".edit-project-name input")).toHaveCount(1);

        // Click edit icon for next project and confirm editing one project name only
        const secondProjectName = await page.locator(":nth-match(.saved-project-name, 2)").innerText();
        await page.click(":nth-match(.edit-project-name i, 2)");
        await expect(page.locator(".edit-project-name input")).toHaveCount(1);
        await expect(page.locator(".edit-project-name input")).toHaveValue(secondProjectName);
    });
});
