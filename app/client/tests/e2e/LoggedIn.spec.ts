/// <reference lib="dom"/>

import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import config from '../../src/resources/config.json';

test.describe('Logged in Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${config.server_url}/login/mock`);
    await page.goto(config.client_url);
  });

  test('should display Logout button', async ({ page }) => {
    await expect(page.locator('.auth')).toContainText('Logout');
  });

  test('should display Login buttons after Logging out', async ({ page }) => {
    await page.click('text=Logout');
    await expect(page.locator('.auth')).toContainText('Login');
  });

  test('should display dropzone', async ({ page }) => {
    await expect(page.locator('.dropzone')).toBeVisible();
  });

  test('should update file list when files are dropped, process them in WebWorker and submit on click to backend', async ({ page }) => {
    // Read files into a buffer
    const buffer = readFileSync('./tests/files/6930_8_13.fa', { encoding: 'utf8', flag: 'r' });
    const buffer2 = readFileSync('./tests/files/6930_8_11.fa', { encoding: 'utf8', flag: 'r' });
    // Create the DataTransfer and add Files
    const dataTransfer = await page.evaluateHandle(
      ({ data, data2 }) => {
        const dt = new DataTransfer();
        const file = new File([data.toString()], '6930_8_13.fa', { type: 'text/plain' });
        const file2 = new File([data2.toString()], '6930_8_11.fa', { type: 'text/plain' });
        dt.items.add(file);
        dt.items.add(file2);
        return dt;
      },
      {
        data: buffer,
        data2: buffer2,
      },
    );
    // Dropping files to dropzone
    await page.dispatchEvent('.dropzone', 'drop', { dataTransfer });
    // Expect count of files to be 2
    await expect(page.locator('.count')).toContainText('2');
    // Expect files, hashes, AMR and Sketch appearing in file list
    await expect(page.locator('.uploaded-info')).toContainText('6930_8_13.fa e868c76fec83ee1f69a95bd27b8d5e76 filename 14');
    await expect(page.locator('.uploaded-info')).toContainText('6930_8_11.fa f3d9b387e311d5ab59a8c08eb3545dbb filename 14');
    //expect to have a 'start analysis' button after submitting files
    await expect(page.locator('.start-analysis')).toContainText('Start Analysis');
    // Expect to see 'submitted' status once button was pressed
    await page.click('text=Start Analysis');
    await expect(page.locator('.status')).toContainText('"submitted": "submitted"');
    await expect(page.locator('.status')).toContainText('"assign": "submitted"');
    await expect(page.locator('.status')).toContainText('"microreact": "submitted"');
    await expect(page.locator('.status')).toContainText('"network": "submitted"');
  });
});
