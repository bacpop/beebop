/// <reference lib="dom"/>
/* eslint-disable no-tabs */

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
    // Expect table to appear
    await expect(page.locator('table')).toHaveCount(1);
    // Expect files, hashes, AMR and Sketch appearing in table
    await page.waitForTimeout(10000);
    await expect(page.locator('tr:has-text("6930_8_13.fa")')).toContainText(['6930_8_13.fa', '✔', 'PCETE SXT']);
    await expect(page.locator('tr:has-text("6930_8_11.fa")')).toContainText(['6930_8_11.fa', '✔', 'PCETE SXT']);
    // expect to have a 'start analysis' button after submitting files
    await expect(page.locator('.start-analysis')).toContainText('Start Analysis');
    // Expect to see ProgressBar once button was pressed
    await page.click('text=Start Analysis');
    await expect(page.locator('.progress-bar')).toHaveCount(1);
    // Expect all jobs to finish
    await page.waitForTimeout(20000);
    await expect(page.locator('.progress-bar')).toContainText('100.00%');
    // Expect clusters appearing in table
    await expect(page.locator('tr:has-text("6930_8_13.fa")')).toContainText(['6930_8_13.fa', '✔', 'PCETE SXT', '7']);
    await expect(page.locator('tr:has-text("6930_8_11.fa")')).toContainText(['6930_8_11.fa', '✔', 'PCETE SXT', '24']);
    // Expect download buttons and button to generate microreact URL to appear
    await expect(page.locator('tr:has-text("6930_8_13.fa") .btn').nth(0)).toContainText('Download zip file');
    await expect(page.locator('tr:has-text("6930_8_13.fa") .btn').nth(1)).toContainText('Generate Microreact URL');
    await expect(page.locator('tr:has-text("6930_8_13.fa") .btn').nth(2)).toContainText('Download zip file');
    // on clicking Generate Microreact URL button, modal appears
    await page.click('text=Generate Microreact URL');
    await expect(page.locator('.modalFlex')).toContainText('No Token submitted yet');
    await expect(page.locator('.modalFlex .btn')).toContainText('Save Token');
    // after submittink microreact token, button turns into link to microreact.org
    await page.locator('input').fill(process.env.MICROREACT_TOKEN as string);
    await page.click('text=Save Token');
    await expect(page.locator('tr:has-text("6930_8_13.fa") a')).toContainText('Visit Microreact URL');
    await expect(page.locator('tr:has-text("6930_8_13.fa") a')).toHaveAttribute('href', /https:\/\/microreact.org\/project\/.*-poppunk.*/);
  });
});
