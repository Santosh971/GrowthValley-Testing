import { test, expect } from '@playwright/test';

const TEST_ADMIN = {
  email: 'admin@growthvalley.com',
  password: 'Admin@123456',
};

test.describe('Admin Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login form', async ({ page }) => {
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.fill('input[type="email"]', TEST_ADMIN.email);
    await page.fill('input[type="password"]', TEST_ADMIN.password);
    await page.click('button[type="submit"]');

    // Should redirect to admin dashboard
    await expect(page).toHaveURL(/admin/);
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.fill('input[type="email"]', 'wrong@test.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=invalid, incorrect, or failed')).toBeVisible({ timeout: 5000 }).catch(() => {
      // Alternative: check for any error text
      return expect(page.locator('.error, [role="alert"]')).toBeVisible();
    });
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.fill('input[type="email"]', TEST_ADMIN.email);
    await page.fill('input[type="password"]', TEST_ADMIN.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/admin/);

    // Click logout button
    await page.click('button[title="Logout"]');

    // Should redirect to login
    await expect(page).toHaveURL(/login/);
  });
});