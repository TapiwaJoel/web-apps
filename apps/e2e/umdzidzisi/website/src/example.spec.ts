import { test, expect } from '@playwright/test';

/**
 * Smoke test for the umdzidzisi-website remote, exercised through the shell host
 * the way a real user reaches it: navigate the shell to `/umdzidzisi-website`,
 * which lazy-loads the remote via native federation, then assert the remote's
 * own UI rendered. The website remote is `auth: none`, so no login is needed.
 */
test('loads the umdzidzisi-website remote through the shell', async ({
  page,
}) => {
  await page.goto('/umdzidzisi-website');

  await expect(
    page.getByRole('heading', { name: 'Umdzidzisi - Feature Module' }),
  ).toBeVisible();
});
