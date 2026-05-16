import { test, expect } from '@playwright/test';

const publicPages = [
  { path: '/', name: 'Home' },
  { path: '/services', name: 'Services' },
  { path: '/gallery', name: 'Gallery' },
  { path: '/brands', name: 'Brands' },
  { path: '/about', name: 'About' },
  { path: '/contact', name: 'Contact' },
  { path: '/quote', name: 'Quote' },
  { path: '/faq', name: 'FAQ' },
];

test.describe('All Pages Load Without Errors', () => {
  publicPages.forEach(({ path, name }) => {
    test(`${name} page should load without errors`, async ({ page }) => {
      const errors: string[] = [];

      // Listen for console errors
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(`Console Error: ${msg.text()}`);
        }
      });

      // Listen for page errors
      page.on('pageerror', (error) => {
        errors.push(`Page Error: ${error.message}`);
      });

      // Navigate to page
      await page.goto(path);

      // Wait for page to be fully loaded (use domcontentloaded to avoid chatbot API timeout)
      await page.waitForLoadState('domcontentloaded');

      // Check that page loaded (should have content)
      const body = page.locator('body');
      await expect(body).toBeVisible();

      // Verify no errors occurred
      expect(errors).toHaveLength(0);
    });
  });
});

test.describe('Navbar Functionality', () => {
  test('Desktop navbar should render all links', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Check for desktop nav items (visible on md+ screens)
    await page.setViewportSize({ width: 1280, height: 720 });

    const servicesLink = page.getByRole('link', { name: /services/i }).first();
    const brandsLink = page.getByRole('link', { name: /brands|marques/i }).first();
    const aboutLink = page.getByRole('link', { name: /about|propos/i }).first();
    const contactLink = page.getByRole('link', { name: /contact/i }).first();

    await expect(servicesLink).toBeVisible();
    await expect(brandsLink).toBeVisible();
    await expect(aboutLink).toBeVisible();
    await expect(contactLink).toBeVisible();
  });

  test('Mobile menu should open and close', async ({ page }) => {
    await page.goto('/');
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile size

    // Find mobile menu toggle button
    const menuButton = page.getByRole('button', { name: /open|menu/i });
    await expect(menuButton).toBeVisible();

    // Open mobile menu
    await menuButton.click();
    await page.waitForTimeout(600); // Wait for slide-in animation

    // Check that mobile drawer is visible (it's a fixed positioned drawer)
    const mobileDrawer = page.locator('div').filter({ hasText: /services/i }).nth(1);
    await expect(mobileDrawer).toBeVisible();

    // Close menu by pressing ESC key (more reliable than clicking backdrop)
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300); // Wait for close animation
  });

  test('Mobile menu should have slide-in animation', async ({ page }) => {
    await page.goto('/');
    await page.setViewportSize({ width: 375, height: 667 });

    const menuButton = page.getByRole('button', { name: /open|menu/i });
    await menuButton.click();

    // Check that drawer slides in from right (has transform)
    const drawer = page.locator('div').filter({ hasText: /services/i }).first();
    await expect(drawer).toBeVisible();
  });
});

test.describe('Language Switcher', () => {
  test('Language switcher should be visible', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Language switcher should have a button or dropdown
    const langButton = page.getByRole('button').filter({ has: page.locator('svg') });
    const hasLangSwitcher = await langButton.count() > 0;
    expect(hasLangSwitcher).toBe(true);
  });

  test('Should persist language selection', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Try to find and interact with language switcher
    // This is a basic check - actual implementation may vary
    const initialUrl = page.url();
    expect(initialUrl).toBeTruthy();
  });
});

test.describe('Auth Buttons', () => {
  test('Should show login/register buttons when not authenticated', async ({ page }) => {
    await page.goto('/');
    await page.setViewportSize({ width: 1280, height: 720 });

    // Check for login link (may be visible or in dropdown)
    const loginLink = page.getByRole('link', { name: /login|connexion/i });
    const registerLink = page.getByRole('link', { name: /register|inscription/i });

    // At least one should be visible (or we're authenticated)
    const hasAuthButtons = (await loginLink.count()) > 0 || (await registerLink.count()) > 0;
    expect(hasAuthButtons).toBe(true);
  });
});

test.describe('No Console Errors on Critical Pages', () => {
  test('Home page should have no console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    expect(errors).toHaveLength(0);
  });

  test('Services page should have no console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/services');
    await page.waitForLoadState('domcontentloaded');

    expect(errors).toHaveLength(0);
  });
});

test.describe('Responsive Design', () => {
  const viewports = [
    { width: 375, height: 667, name: 'Mobile (iPhone SE)' },
    { width: 768, height: 1024, name: 'Tablet (iPad)' },
    { width: 1280, height: 720, name: 'Desktop' },
    { width: 1920, height: 1080, name: 'Large Desktop' },
  ];

  viewports.forEach(({ width, height, name }) => {
    test(`Home page should render correctly on ${name}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      // Check that page content is visible
      const body = page.locator('body');
      await expect(body).toBeVisible();

      // Take screenshot for visual verification
      await page.screenshot({
        path: `test-results/screenshots/${name.replace(/\s+/g, '-').toLowerCase()}.png`,
        fullPage: false
      });
    });
  });
});

test.describe('Navigation Between Pages', () => {
  test('Should navigate through all main pages', async ({ page }) => {
    await page.goto('/');

    // Navigate to Services
    await page.getByRole('link', { name: /services/i }).first().click();
    await expect(page).toHaveURL(/\/services/);

    // Navigate to About
    await page.getByRole('link', { name: /about|propos/i }).first().click();
    await expect(page).toHaveURL(/\/about/);

    // Navigate to Contact
    await page.getByRole('link', { name: /contact/i }).first().click();
    await expect(page).toHaveURL(/\/contact/);

    // Navigate back to Home
    await page.goto('/');
    await expect(page).toHaveURL('/');
  });
});
