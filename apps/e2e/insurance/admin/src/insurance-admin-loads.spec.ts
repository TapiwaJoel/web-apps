import { test, expect } from '@playwright/test';

/**
 * Smoke test for the insurance-admin remote, exercised through the shell host
 * the way a real user reaches it: navigate the shell to `/insurance-admin`,
 * which lazy-loads the remote via native federation. This remote is
 * `auth: required`, so the shell's requiredAuthGuard redirects to `/login`.
 * Without a backend we cannot authenticate, so the honest smoke test asserts
 * that redirect to the login screen and that the login form rendered.
 */
test('redirects to login when reaching the insurance-admin remote (auth required)', async ({
  page,
}) => {
  await page.goto('/insurance-admin');

  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByPlaceholder('Enter your password')).toBeVisible();
});
