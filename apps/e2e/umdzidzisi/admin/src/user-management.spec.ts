import { test, expect, type Page, type Request } from '@playwright/test';

/**
 * Users, Roles and Profile pages in umdzidzisi-admin, against a stubbed
 * gateway.
 *
 * These pages are shared with insurance-admin (`@mushaviri/ui`); what's
 * umdzidzisi-specific is the `serviceName` they scope users/roles to, which the
 * remote provides as `learning-management-service`. The session is restored
 * the way a reload restores it — `refresh-token` + `my-permissions` — so the
 * shell's requiredAuthGuard lets `/umdzidzisi-admin/**` through.
 */

const SERVICE_NAME: string = 'learning-management-service';
const TIMESTAMP: string = '2026-01-01T00:00:00.000Z';

function ok(data: unknown): string {
  return JSON.stringify({
    statusCode: 200,
    success: true,
    message: 'ok',
    data,
  });
}

function page1<T>(docs: T[]): unknown {
  return {
    docs,
    totalDocs: docs.length,
    limit: 100,
    page: 1,
    totalPages: 1,
    hasNextPage: false,
    nextPage: null,
    hasPrevPage: false,
    prevPage: null,
    pagingCounter: 1,
  };
}

const SYSTEM_USER: Record<string, unknown> = {
  _id: 'system-user-1',
  name: 'Tendai Moyo',
  phoneNumber: '+263771234567',
  emailAddress: 'tendai@example.com',
  country: 'country-1',
  user: 'user-1',
  role: 'role-1',
  status: 'ACTIVE',
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP,
};

const ROLE: Record<string, unknown> = {
  _id: 'role-1',
  name: 'Content Manager',
  description: 'Manages subjects and papers',
  serviceName: SERVICE_NAME,
  isSensitive: false,
  status: 'ACTIVE',
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP,
};

const SESSION: Record<string, unknown> = {
  _id: 'auth-1',
  authenticationSettings: {
    authentication: 'auth-1',
    isTwoFactorEnabled: false,
    createdAt: TIMESTAMP,
    updatedAt: TIMESTAMP,
  },
  user: {
    _id: 'user-1',
    name: 'Tendai Moyo',
    phoneNumber: '+263771234567',
    emailAddress: 'tendai@example.com',
    userType: 'individual',
    status: 'ACTIVE',
    country: 'country-1',
    role: 'role-1',
    createdAt: TIMESTAMP,
    updatedAt: TIMESTAMP,
  },
  systemUser: SYSTEM_USER,
  device: [],
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP,
};

/** True when `url` is a `user-management-service/<resource>` call (any query string). */
function isResource(resource: string): (url: URL) => boolean {
  return (url: URL): boolean =>
    url.pathname.endsWith(`/user-management-service/${resource}`);
}

/**
 * Stubs the gateway for an authenticated admin session, and records every
 * system-users / roles list request so the `serviceName` scope can be asserted.
 */
async function stubGateway(page: Page): Promise<Request[]> {
  const scopedRequests: Request[] = [];

  await page.route(isResource('authentications/refresh-token'), (route) =>
    route.fulfill({ contentType: 'application/json', body: ok(SESSION) }),
  );
  await page.route(isResource('authentications/my-permissions'), (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: ok({
        roleId: 'role-1',
        roleName: 'Content Manager',
        permissions: ['read'],
        deviceId: 'device-1',
      }),
    }),
  );
  await page.route(isResource('system-users'), (route) => {
    scopedRequests.push(route.request());
    return route.fulfill({
      contentType: 'application/json',
      body: ok(page1([SYSTEM_USER])),
    });
  });
  await page.route(isResource('roles'), (route) => {
    scopedRequests.push(route.request());
    return route.fulfill({
      contentType: 'application/json',
      body: ok(page1([ROLE])),
    });
  });
  for (const resource of ['permissions', 'role-permissions', 'audit-trail']) {
    await page.route(isResource(resource), (route) =>
      route.fulfill({ contentType: 'application/json', body: ok(page1([])) }),
    );
  }
  await page.route(isResource('devices'), (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: ok(
        page1([
          {
            deviceId: 'device-1',
            name: 'MacBook Pro',
            platform: 'macOS',
            browser: 'Chrome',
            deviceType: 'desktop',
            isActive: true,
            lastUsedAt: TIMESTAMP,
          },
        ]),
      ),
    }),
  );

  return scopedRequests;
}

test.describe('umdzidzisi-admin user management', () => {
  test('users page lists users scoped to the learning-management service', async ({
    page,
  }) => {
    const scopedRequests: Request[] = await stubGateway(page);

    await page.goto('/umdzidzisi-admin/users');

    await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();
    await expect(page.getByText('Tendai Moyo').first()).toBeVisible();
    expect(scopedRequests.length).toBeGreaterThan(0);
    for (const request of scopedRequests) {
      expect(new URL(request.url()).searchParams.get('serviceName')).toBe(
        SERVICE_NAME,
      );
    }
  });

  test('users page opens the create-user dialog', async ({ page }) => {
    await stubGateway(page);

    await page.goto('/umdzidzisi-admin/users');
    await page.getByRole('button', { name: 'New User' }).click();

    await expect(
      page.getByRole('heading', { name: 'Create System User' }),
    ).toBeVisible();
  });

  test('roles page lists roles and opens the create-role dialog', async ({
    page,
  }) => {
    await stubGateway(page);

    await page.goto('/umdzidzisi-admin/roles');

    await expect(page.getByRole('heading', { name: 'Roles' })).toBeVisible();
    await expect(page.getByText('Content Manager').first()).toBeVisible();

    await page.getByRole('button', { name: 'New Role' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('roles/:id opens the role detail drawer', async ({ page }) => {
    await stubGateway(page);

    await page.goto('/umdzidzisi-admin/roles/role-1');

    await expect(page.getByText('Manages subjects and papers')).toBeVisible();
  });

  test('profile page shows the session user and their devices', async ({
    page,
  }) => {
    await stubGateway(page);

    await page.goto('/umdzidzisi-admin/profile');

    await expect(
      page.getByRole('heading', { name: 'Tendai Moyo' }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Devices' })).toBeVisible();
    await expect(page.getByText('MacBook Pro')).toBeVisible();
  });
});
