/// <reference lib="dom"/>

import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
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

  test('should display Start Analysis button once files were submitted and job status once pressed)', async ({ page }) => {
    // Read file into a buffer
    const buffer = readFileSync('./tests/files/6930_8_11.fa');
    // Create the DataTransfer and File
    const dataTransfer = await page.evaluateHandle((data) => {
      const dt = new DataTransfer();
      const file = new File([data.toString('hex')], '6930_8_11.fa', { type: 'text/plain' });
      dt.items.add(file);
      return dt;
    }, buffer);
    // Do the same for second file
    const buffer2 = readFileSync('./tests/files/6930_8_13.fa');
    const dataTransfer2 = await page.evaluateHandle((data) => {
      const dt = new DataTransfer();
      const file = new File([data.toString('hex')], '6930_8_13.fa', { type: 'text/plain' });
      dt.items.add(file);
      return dt;
    }, buffer2);
    await page.dispatchEvent('.dropzone', 'drop', { dataTransfer });
    await page.dispatchEvent('.dropzone', 'drop', { dataTransfer2 });
    await expect(page.locator('.startAnalysis')).toContainText('Start Analysis');
    await page.click('text=Start Analysis');
    await expect(page.locator('.startAnalysis')).toContainText('Job status:');
  });
});
