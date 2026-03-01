import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:5173';

test.describe('Saola Desktop App', () => {
  test('app loads and shows main UI', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator('.app')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.app-title')).toContainText('Saola');
  });

  test('collections sidebar is visible', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator('.sidebar')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.sidebar-header')).toContainText('Collections');
  });

  test('request builder is visible with method select and URL input', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator('.request-line')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.method-select')).toBeVisible();
    await expect(page.locator('.url-input')).toBeVisible();
    await expect(page.locator('.send-btn')).toBeVisible();
  });

  test('method dropdown displays selected value', async ({ page }) => {
    await page.goto(BASE);
    const methodSelect = page.locator('.method-select');
    await expect(methodSelect).toBeVisible({ timeout: 5000 });

    const value = await methodSelect.inputValue();
    expect(value).toBeTruthy();
    expect(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']).toContain(value);

    await methodSelect.selectOption('POST');
    await expect(methodSelect).toHaveValue('POST');
  });

  test('send request and get response', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator('.send-btn')).toBeVisible({ timeout: 5000 });

    await page.click('.send-btn');
    await page.waitForTimeout(3000);

    const statusBadge = page.locator('.status-badge');
    await expect(statusBadge).toBeVisible({ timeout: 5000 });
    await expect(statusBadge).toContainText(/2\d{2}/);
  });

  test('request tabs work', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator('.tab-new')).toBeVisible({ timeout: 5000 });
    await page.click('.tab-new');
    await expect(page.locator('.request-tab')).toHaveCount(2);
  });

  test('code snippet modal opens and shows snippet', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator('.code-btn')).toBeVisible({ timeout: 5000 });
    await page.locator('.url-input').fill('https://httpbin.org/get');
    await page.locator('.code-btn').click();
    await expect(page.locator('.code-snippet-modal')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('.code-snippet-output')).toContainText(/curl|fetch|requests/);
    await page.locator('.code-snippet-modal button[aria-label="Close"]').click();
    await expect(page.locator('.code-snippet-modal')).not.toBeVisible();
  });
});
