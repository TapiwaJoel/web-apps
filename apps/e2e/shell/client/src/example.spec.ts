import { test, expect } from '@playwright/test';

/**
 * Smoke test for the shell-client host itself (not a remote). The root route
 * redirects unauthenticated users to `/login`, so we assert we land on the
 * login screen with its form. The login heading is dynamic, so we assert on the
 * stable password field and the "Sign In" submit button.
 */
test('shell-client redirects to the login screen', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByPlaceholder('Enter your password')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
});
