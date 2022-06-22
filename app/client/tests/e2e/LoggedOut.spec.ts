import { test, expect } from '@playwright/test';
import config from '../../src/resources/config.json';

test.describe('Logged out Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(config.client_url);
  });

  test('should display greeting on start page', async ({ page }) => {
    await expect(page.locator('.home')).toContainText('Welcome to beebop!');
  });

  test('should display version info when clicking on about', async ({ page }) => {
    await page.click('text=About');
    await expect(page.locator('.about:has(.version-info)')).toContainText(['beebop']);
  });

  test('should display Login button', async ({ page }) => {
    await expect(page.locator('.auth')).toContainText('Login');
  });
});
