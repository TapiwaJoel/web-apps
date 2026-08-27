import { test, expect } from '@playwright/test';

/**
 * Smoke test for the umdzidzisi-client remote, exercised through the shell host
 * the way a real user reaches it: navigate the shell to `/umdzidzisi-client`,
 * which lazy-loads the remote via native federation. The client remote is
 * `auth: optional`, so the route loads without login. Its routes are empty, so
 * only an empty `<router-outlet>` renders — the honest smoke test asserts we
 * stayed on the client route and were not redirected to `/login`.
 */
test('loads the umdzidzisi-client remote without requiring login (auth optional)', async ({
  page,
}) => {
  await page.goto('/umdzidzisi-client');

  await expect(page).toHaveURL(/\/umdzidzisi-client/);
  await expect(page).not.toHaveURL(/\/login/);
});
