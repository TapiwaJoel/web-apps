import { test, expect, type Page, type Request } from '@playwright/test';

/**
 * System-user activation for the shell-admin host, against a stubbed gateway.
 *
 * The user arrives from an emailed link (`/activate-account?token=...`, no
 * session yet) and sets a password to activate their `SystemUser` account.
 * `page.route()` stands in for the gateway so the suite runs with no
 * `backend-services` checkout — see `login.spec.ts` for the equivalent
 * pattern on the sign-in flow.
 *
 * The notification toast component (`libs/ui`) has no `data-testid` of its
 * own, so error assertions target its rendered text via `getByText` rather
 * than a testid (unlike `login.spec.ts`'s `login-error`, which targets a
 * testid that doesn't exist on that component either).
 */
const ACTIVATE_URL: string =
  '**/user-management-service/system-users/activations';
const PERMISSIONS_URL: string =
  '**/user-management-service/authentications/my-permissions';

const ACTIVATE_RESPONSE: string = JSON.stringify({
  statusCode: 200,
  success: true,
  message: 'Account activated successfully',
  data: {
    _id: 'system-user-1',
    name: 'Test User',
    phoneNumber: '+263771234567',
    emailAddress: 'admin@example.com',
    country: 'country-1',
    user: 'user-1',
    role: 'role-1',
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
});

/** No session exists yet on this screen, so keep the app initializer logged out. */
async function stubLoggedOut(page: Page): Promise<void> {
  await page.route(PERMISSIONS_URL, (route) =>
    route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ statusCode: 401, message: 'Unauthorized' }),
    }),
  );
}

async function fillPasswords(page: Page, password: string): Promise<void> {
  await page.getByTestId('activate-password').fill(password);
  await page.getByTestId('activate-confirm-password').fill(password);
}

test.describe('shell-admin activate account', () => {
  test.beforeEach(async ({ page }) => {
    await stubLoggedOut(page);
  });

  test('activates the account and navigates to /login', async ({ page }) => {
    await page.route(ACTIVATE_URL, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: ACTIVATE_RESPONSE,
      }),
    );

    await page.goto('/activate-account?token=stub-jwt-token');
    await fillPasswords(page, 'Str0ng!Pass');
    await page.getByTestId('activate-submit').click();

    await expect(page).toHaveURL(/\/login/);
  });

  test('sends the token and password in the request body', async ({ page }) => {
    const requests: Request[] = [];
    await page.route(ACTIVATE_URL, (route) => {
      requests.push(route.request());
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: ACTIVATE_RESPONSE,
      });
    });

    await page.goto('/activate-account?token=stub-jwt-token');
    await fillPasswords(page, 'Str0ng!Pass');
    await page.getByTestId('activate-submit').click();

    await expect(page).toHaveURL(/\/login/);
    expect(requests).toHaveLength(1);
    expect(requests[0].postDataJSON()).toEqual({
      token: 'stub-jwt-token',
      password: 'Str0ng!Pass',
    });
  });

  test('shows an invalid-link message when the token is missing', async ({
    page,
  }) => {
    let calls: number = 0;
    await page.route(ACTIVATE_URL, (route) => {
      calls++;
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: ACTIVATE_RESPONSE,
      });
    });

    await page.goto('/activate-account');

    await expect(page.getByTestId('activate-invalid-link')).toBeVisible();
    await expect(page.getByTestId('activate-password')).toHaveCount(0);
    expect(calls).toBe(0);
  });

  test('blocks submit when passwords do not match, without calling the API', async ({
    page,
  }) => {
    let calls: number = 0;
    await page.route(ACTIVATE_URL, (route) => {
      calls++;
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: ACTIVATE_RESPONSE,
      });
    });

    await page.goto('/activate-account?token=stub-jwt-token');
    await page.getByTestId('activate-password').fill('Str0ng!Pass');
    await page.getByTestId('activate-confirm-password').fill('Different!Pass1');
    await page.getByTestId('activate-submit').click();

    await expect(page.getByText('Passwords do not match.')).toBeVisible();
    await expect(page).toHaveURL(/\/activate-account/);
    expect(calls).toBe(0);
  });

  test('shows the server error message and stays on /activate-account', async ({
    page,
  }) => {
    await page.route(ACTIVATE_URL, (route) =>
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({
          statusCode: 404,
          success: false,
          message: 'System user is not in PENDING status',
        }),
      }),
    );

    await page.goto('/activate-account?token=stub-jwt-token');
    await fillPasswords(page, 'Str0ng!Pass');
    await page.getByTestId('activate-submit').click();

    await expect(
      page.getByText('System user is not in PENDING status'),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/activate-account/);
  });
});
