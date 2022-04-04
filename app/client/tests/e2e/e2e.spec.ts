import { test, expect, Page } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080/');
});


test.describe('Basic Tests', () => {
    test('should display greeting on start page', async ({ page }) => {
        await expect(page.locator('.home')).toHaveText("Welcome to beebop!");
    });

    
    test('should display version info when clicking on about', async ({ page }) => {
        await page.click('text=About');
        await expect(page.locator('.about:has(.version-info)')).toContainText(["beebop"]);
    });

});