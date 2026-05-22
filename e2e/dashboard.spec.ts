import { test, expect } from '@playwright/test';

test.describe('Dashboard Features', () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage to ensure clean state
    await page.context().clearCookies();
  });

  test('User can log in and view dashboard overview', async ({ page }) => {
    await page.goto('/login');
    
    // Fill login form
    await page.fill('input[type="email"]', 'user@example.com');
    await page.fill('input[type="password"]', 'User123!');
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
    
    // Check for welcome message
    await expect(page.getByText(/welcome back/i)).toBeVisible();
    
    // Check for dashboard cards
    await expect(page.getByText(/quote history/i)).toBeVisible();
    await expect(page.getByText(/messages/i)).toBeVisible();
    await expect(page.getByText(/profile/i)).toBeVisible();
  });

  test('User can navigate to Message History', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'user@example.com');
    await page.fill('input[type="password"]', 'User123!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });

    // Click on Messages card or title
    await page.click('text=Open Inbox');

    // Should see Message History header
    await expect(page.getByText(/my message history/i)).toBeVisible();
    
    // Should have a button to contact support if empty (or list items if seeded)
    const emptyMessage = page.getByText(/no messages found/i);
    const contactButton = page.getByText(/contact support/i);
    
    if (await emptyMessage.isVisible()) {
      await expect(contactButton).toBeVisible();
    }
  });

  test('Admin can update quote status and user sees it', async ({ page, context }) => {
    // 1. Login as Admin
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@keypro.service');
    await page.fill('input[type="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    
    // Admin redirected to /dashboard first
    await expect(page).toHaveURL('/dashboard');
    
    // Navigate to Admin Dashboard (RoleGuard handles access)
    await page.goto('/admin');
    await expect(page).toHaveURL('/admin');
    
    // Go to Quotes management
    await page.click('text=Total Quotes');
    
    // Find a pending quote and update it
    const firstQuote = page.locator('tr').nth(1); 
    await firstQuote.getByRole('button').first().click(); 
    
    // Update status to APPROVED
    await page.selectOption('select[name="status"]', 'APPROVED');
    await page.fill('textarea[name="adminNotes"]', 'Tested and verified by E2E');
    await page.fill('input[name="estimatedPrice"]', '150');
    await page.click('button:has-text("Update")');
    
    // Verify success toast/message
    await expect(page.getByText(/quote updated/i)).toBeVisible();

    // 2. Switch to User view to verify
    const userPage = await context.newPage();
    await userPage.goto('/login');
    await userPage.fill('input[type="email"]', 'user@example.com');
    await userPage.fill('input[type="password"]', 'User123!');
    await userPage.click('button[type="submit"]');
    
    // Click "View History" on the Quotes card
    await userPage.click('text=View History');
    
    // Check if the updated quote shows APPROVED and the technician note
    await expect(userPage.getByText('APPROVED').first()).toBeVisible();
    await expect(userPage.getByText(/Tested and verified by E2E/)).toBeVisible();
    await expect(userPage.getByText('€150')).toBeVisible();
  });
});
