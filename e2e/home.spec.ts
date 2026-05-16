import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load the home page correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check for hero title
    const title = page.locator('h1');
    await expect(title).toBeVisible();
    
    // Check for CTA buttons
    const quoteButton = page.getByRole('link', { name: /quote|devis/i });
    await expect(quoteButton).toBeVisible();
  });

  test('should navigate to services page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /services/i }).first().click();
    await expect(page).toHaveURL(/\/services/);
  });
});

test.describe('Auth Flow', () => {
  test('should show login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /welcome back|connexion/i })).toBeVisible();
  });
});
