import { test, expect } from '@playwright/test';

/**
 * Smoke test for the umtengesi-client remote, exercised through the shell host
 * the way a real user reaches it: navigate the shell to `/umtengesi-client`,
 * which lazy-loads the remote via native federation. This remote is
 * `auth: optional`, so the route loads without login. It has empty routes
 * (`appRoutes: []`) and renders only an empty `<router-outlet>` with no visible
 * content of its own, so the honest smoke test asserts we stayed on the client
 * route and were not redirected to `/login`.
 */
test('loads the umtengesi-client remote without requiring login (auth optional)', async ({
  page,
}) => {
  await page.goto('/umtengesi-client');

  await expect(page).toHaveURL(/\/umtengesi-client/);
  await expect(page).not.toHaveURL(/\/login/);
});
