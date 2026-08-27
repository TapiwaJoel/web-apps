import { test, expect } from '@playwright/test';

/**
 * Smoke test for the umdzidzisi-admin remote, exercised through the shell host
 * the way a real user reaches it: navigate the shell to `/umdzidzisi-admin`,
 * which lazy-loads the remote via native federation. The admin remote is
 * `auth: required`, so the shell's requiredAuthGuard fires and redirects to
 * `/login`. There's no backend to authenticate against, so the honest smoke
 * test asserts that redirect + the login form rendered.
 */
test('redirects to login when reaching the umdzidzisi-admin remote (auth required)', async ({
  page,
}) => {
  await page.goto('/umdzidzisi-admin');

  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByPlaceholder('Enter your password')).toBeVisible();
});
