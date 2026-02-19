import { test, expect } from '@playwright/test';

test.use({
  viewport: {
    height: 1080,
    width: 1920
  }
});

test('test', async ({ page }) => {
  await page.goto('http://89.116.20.193:3008/#/login');
  await page.locator('.ant-input-affix-wrapper').first().click();
  await page.getByTestId('login-input-email').click();
  await page.getByTestId('login-input-email').click();
  await page.getByTestId('login-input-email').fill('info@nexgensis.com');
  await page.getByTestId('login-input-password').click();
  await page.getByTestId('login-input-password').fill('Welcome@123');
  await page.getByTestId('login-input-password').press('Enter');
  await page.getByTestId('login-btn-submit').click();
  await page.locator('div').filter({ hasText: /^I$/ }).nth(3).click();
  await page.getByTestId('sidebar-logo-image').click();
  await page.locator('span').filter({ hasText: 'I' }).nth(3).click();
});