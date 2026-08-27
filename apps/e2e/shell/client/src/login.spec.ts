import { test, expect, type Page, type Request } from '@playwright/test';

/**
 * Login flow for the shell-client host, against a stubbed gateway.
 *
 * Auth is httpOnly-cookie based: the browser never sees the JWT, so these tests
 * assert on the request contract and the UI's response to it rather than on any
 * client-side token. `page.route()` stands in for the gateway so the suite runs
 * with no `backend-services` checkout — see `example.spec.ts` for the plain
 * redirect smoke test, which stays independent of this file.
 */

const LOGIN_URL: string = '**/user-management-service/authentications/login';
const PERMISSIONS_URL: string =
  '**/user-management-service/authentications/my-permissions';

/** Shape of `ServiceResponse<WebAuthenticationResponseDto>` — tokens omitted (cookie-borne). */
const LOGIN_RESPONSE: string = JSON.stringify({
  statusCode: 200,
  success: true,
  message: 'Login successful',
  data: {
    _id: 'auth-1',
    authenticationSettings: {
      authentication: 'auth-1',
      isTwoFactorEnabled: false,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    user: {
      _id: 'user-1',
      name: 'Test User',
      phoneNumber: '+263771234567',
      emailAddress: 'admin@example.com',
      userType: 'individual',
      status: 'ACTIVE',
      country: 'country-1',
      role: 'role-1',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    systemUser: {
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
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
});

/**
 * The app initializer probes `my-permissions` on every load to restore a cookie
 * session. Default it to 401 (logged out) so guards behave predictably.
 */
async function stubPermissions(
  page: Page,
  authenticated: boolean = false,
): Promise<void> {
  await page.route(PERMISSIONS_URL, (route) =>
    authenticated
      ? route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            statusCode: 200,
            success: true,
            message: 'ok',
            data: {
              roleId: 'role-1',
              roleName: 'Admin',
              permissions: ['read'],
            },
          }),
        })
      : route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ statusCode: 401, message: 'Unauthorized' }),
        }),
  );
}

async function fillCredentials(page: Page): Promise<void> {
  await page.getByTestId('login-identifier').fill('admin@example.com');
  await page.getByTestId('login-password').fill('correct-horse');
}

test.describe('shell-client login', () => {
  test.beforeEach(async ({ page }) => {
    await stubPermissions(page);
  });

  test('signs in and navigates to the returnUrl', async ({ page }) => {
    await page.route(LOGIN_URL, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        // Mirrors the backend setting the JWT as an httpOnly cookie.
        headers: {
          'set-cookie': 'accessToken=stub; Path=/; HttpOnly; SameSite=Lax',
        },
        body: LOGIN_RESPONSE,
      }),
    );
    // Authenticated from here on, so requiredAuthGuard lets /dashboard through.
    await stubPermissions(page, true);

    await page.goto('/login?returnUrl=%2Fdashboard');
    await fillCredentials(page);
    await page.getByTestId('login-submit').click();

    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('sends identifier (not email) and the web client-type header', async ({
    page,
  }) => {
    const requests: Request[] = [];
    await page.route(LOGIN_URL, (route) => {
      requests.push(route.request());
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: LOGIN_RESPONSE,
      });
    });
    await stubPermissions(page, true);

    await page.goto('/login?returnUrl=%2Fdashboard');
    await fillCredentials(page);
    await page.getByTestId('login-submit').click();

    await expect(page).toHaveURL(/\/dashboard/);
    expect(requests).toHaveLength(1);

    // Guards the contract this feature exists to fix: the backend field is
    // `identifier` (email OR phone), never `email`.
    expect(requests[0].postDataJSON()).toEqual({
      identifier: 'admin@example.com',
      password: 'correct-horse',
    });
    expect(await requests[0].headerValue('x-client-type')).toBe('web');
  });

  test('shows the server error message and stays on /login', async ({
    page,
  }) => {
    await page.route(LOGIN_URL, (route) =>
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          statusCode: 401,
          success: false,
          message: 'Invalid credentials',
        }),
      }),
    );

    await page.goto('/login');
    await fillCredentials(page);
    await page.getByTestId('login-submit').click();

    await expect(page.getByTestId('login-error')).toHaveText(
      'Invalid credentials',
    );
    await expect(page).toHaveURL(/\/login/);
  });

  test('blocks an empty submit without calling the API', async ({ page }) => {
    let calls: number = 0;
    await page.route(LOGIN_URL, (route) => {
      calls++;
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: LOGIN_RESPONSE,
      });
    });

    await page.goto('/login');
    await page.getByTestId('login-submit').click();

    await expect(
      page.getByText('Email or phone number is required.'),
    ).toBeVisible();
    await expect(page.getByText('Password is required.')).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
    expect(calls).toBe(0);
  });
});
