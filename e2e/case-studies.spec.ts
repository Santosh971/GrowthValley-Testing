import { test, expect } from '@playwright/test';

const TEST_ADMIN = {
  email: 'admin@growthvalley.com',
  password: 'Admin@123456',
};

test.describe('Case Studies Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_ADMIN.email);
    await page.fill('input[type="password"]', TEST_ADMIN.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/admin/);
  });

  test('should display case studies list page', async ({ page }) => {
    await page.goto('/admin/case-studies');
    await expect(page.locator('h1')).toContainText('Case Studies');
  });

  test('should create a new case study', async ({ page }) => {
    await page.goto('/admin/case-studies/new');

    // Fill in the form
    await page.fill('input[name="title"]', 'Test Case Study E2E');
    await page.fill('input[name="clientName"]', 'Test Client E2E');
    await page.selectOption('select[name="industry"]', 'Technology');
    await page.fill('textarea[name="challenge"]', 'Test challenge description.');
    await page.fill('textarea[name="solution"]', 'Test solution description.');
    await page.selectOption('select[name="status"]', 'draft');

    // Submit the form
    await page.click('button[type="submit"]');

    // Should redirect to case studies list
    await expect(page).toHaveURL(/admin\/case-studies/);
  });

  test('should display images on edit page (Bug 2 - Images visible)', async ({ page }) => {
    await page.goto('/admin/case-studies');
    
    const editLink = page.locator('a[href*="/admin/case-studies/"]').first();
    if (await editLink.isVisible()) {
      await editLink.click();

      // Wait for form to load
      await expect(page.locator('input[name="title"]')).not.toBeEmpty({ timeout: 5000 });

      // Check if images section exists (even if empty, the structure should be there)
      await expect(page.locator('text=Featured Image')).toBeVisible();
      await expect(page.locator('text=Client Logo')).toBeVisible();
    }
  });
});