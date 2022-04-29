import { test, expect } from '@playwright/test';
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
  });
