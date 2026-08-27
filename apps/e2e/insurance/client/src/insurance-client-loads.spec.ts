import { test, expect } from '@playwright/test';

/**
 * Smoke test for the insurance-client remote, exercised through the shell host
 * the way a real user reaches it: navigate the shell to `/insurance-client`,
 * which lazy-loads the remote via native federation, then assert the remote's
 * own UI rendered. This remote is `auth: optional`, so the route loads without
 * a login and we should never be redirected to `/login`.
 */
test('loads the insurance-client remote through the shell (auth optional)', async ({
  page,
}) => {
  await page.goto('/insurance-client');

  await expect(
    page.getByRole('heading', { name: 'Insurance - Client' }),
  ).toBeVisible();
  await expect(page).not.toHaveURL(/\/login/);
});
