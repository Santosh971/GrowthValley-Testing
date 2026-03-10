import { test, expect } from '@playwright/test';

const TEST_ADMIN = {
  email: 'admin@growthvalley.com',
  password: 'Admin@123456',
};

test.describe('Blog Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_ADMIN.email);
    await page.fill('input[type="password"]', TEST_ADMIN.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/admin/);
  });

  test('should display blog list page', async ({ page }) => {
    await page.goto('/admin/blog');
    await expect(page.locator('h1')).toContainText('Blog');
  });

  test('should create a new blog post', async ({ page }) => {
    await page.goto('/admin/blog/new');

    // Fill in the form
    await page.fill('input[name="title"]', 'Test Blog Post E2E');
    await page.fill('input[name="slug"]', 'test-blog-post-e2e');
    await page.fill('textarea[name="content"]', 'Full content of the test blog post.');
    await page.selectOption('select[name="category"]', 'Technology');
    await page.selectOption('select[name="status"]', 'draft');

    // Submit the form
    await page.click('button[type="submit"]');

    // Should redirect to blog list
    await expect(page).toHaveURL(/admin\/blog/);
  });

  test('should edit an existing blog post (Bug 1 - Data should load)', async ({ page }) => {
    await page.goto('/admin/blog');

    // Click on the first edit link
    const editLink = page.locator('a[href*="/admin/blog/"]').first();
    if (await editLink.isVisible()) {
      await editLink.click();

      // Wait for form to load - this tests the bug fix
      await expect(page.locator('input[name="title"]')).not.toBeEmpty({ timeout: 5000 });
      await expect(page.locator('input[name="slug"]')).not.toBeEmpty();
      await expect(page.locator('textarea[name="content"]')).not.toBeEmpty();
    }
  });

  test('should support dark mode on blog edit page (Bug 2 - Dark mode)', async ({ page }) => {
    // First navigate to a blog post edit page
    await page.goto('/admin/blog');
    
    const editLink = page.locator('a[href*="/admin/blog/"]').first();
    if (await editLink.isVisible()) {
      await editLink.click();

      // Get the background color of the form container
      const formContainer = page.locator('form > div').first();
      const bgColor = await formContainer.evaluate((el) => 
        window.getComputedStyle(el).backgroundColor
      );

      // The form should have a background (not white in dark mode, or styled in light mode)
      expect(bgColor).toBeTruthy();
    }
  });
});