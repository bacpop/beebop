import { Page } from "@playwright/test";

export const randomProjectName = () => `project-${Math.random().toString(36).substring(5)}`;

export const uploadFiles = async (page: Page, files = ["e2e/fastaFiles/good_1.fa", "e2e/fastaFiles/good_2.fa"]) => {
  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.getByLabel("Upload").click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(files);
};
