import type { Page, Request, Route } from '@playwright/test';

/**
 * Shared gateway stub for the umdzidzisi-admin learning-management pages.
 *
 * It restores an authenticated session the way a reload does (`refresh-token`
 * + `my-permissions`), so the shell's requiredAuthGuard lets
 * `/umdzidzisi-admin/**` through, and then answers every
 * `learning-management-service` / `content-management-service` call from
 * in-memory fixtures:
 *
 * - `GET <service>/<resource>` returns that resource's fixtures as one page
 *   (`hasNextPage: false`), wrapped in the backend's ServiceResponse envelope.
 *   `subscriptions` uses its own `{ subscriptions, totalCount, … }` shape.
 * - `POST <service>/<resource>` echoes the body back as the created record.
 * - `PATCH <service>/<resource>/<id>` echoes the fixture merged with the body.
 *
 * Every request the stub answers is recorded so specs can assert on headers,
 * query strings and bodies.
 */

export const TIMESTAMP: string = '2026-01-01T00:00:00.000Z';

export const LEARNING_MANAGEMENT: string = 'learning-management-service';
export const CONTENT_MANAGEMENT: string = 'content-management-service';
const USER_MANAGEMENT: string = 'user-management-service';

export type Fixture = Record<string, unknown>;

export interface GatewayFixtures {
  /** `learning-management-service` records keyed by resource path, e.g. `topics`. */
  lms?: Record<string, Fixture[]>;
  /** `content-management-service` records keyed by resource path. */
  cms?: Record<string, Fixture[]>;
  /** `user-management-service/system-users` records (subscribers, learners). */
  systemUsers?: Fixture[];
}

export interface GatewayStub {
  /** Every LMS / CMS request the stub answered, in order. */
  requests: Request[];
}

export function ok(data: unknown, statusCode: number = 200): string {
  return JSON.stringify({ statusCode, success: true, message: 'ok', data });
}

export function page1<T>(docs: T[]): unknown {
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

function subscriptionsPage(subscriptions: Fixture[]): unknown {
  return {
    subscriptions,
    totalCount: subscriptions.length,
    page: 1,
    limit: 100,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  };
}

const SYSTEM_USER: Fixture = {
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

const SESSION: Fixture = {
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

/** The path segments after `/<service>/`, or `null` for another service. */
function segmentsAfter(service: string, url: URL): string[] | null {
  const marker: string = `/${service}/`;
  const index: number = url.pathname.indexOf(marker);
  if (index === -1) {
    return null;
  }
  return url.pathname
    .slice(index + marker.length)
    .split('/')
    .filter((segment: string): boolean => segment.length > 0);
}

function json(route: Route, body: string, status: number = 200): Promise<void> {
  return route.fulfill({ status, contentType: 'application/json', body });
}

let createdCounter: number = 0;

async function answerResource(
  route: Route,
  segments: string[],
  fixtures: Record<string, Fixture[]>,
): Promise<void> {
  const request: Request = route.request();
  const method: string = request.method();
  const [resource, id, ...rest] = segments;
  const records: Fixture[] = fixtures[resource] ?? [];

  if (method === 'POST' && !id) {
    createdCounter += 1;
    const created: Fixture = {
      status: 'Active',
      date: TIMESTAMP,
      ...(request.postDataJSON() as Fixture),
      _id: `created-${resource}-${createdCounter}`,
      createdAt: TIMESTAMP,
      updatedAt: TIMESTAMP,
    };
    return json(route, ok(created, 201), 201);
  }

  if (method === 'PATCH' && id) {
    const existing: Fixture | undefined = records.find(
      (record: Fixture): boolean => record['_id'] === id,
    );
    return json(
      route,
      ok({ ...existing, ...(request.postDataJSON() as Fixture), _id: id }),
    );
  }

  if (method === 'GET' && id && rest.length === 0) {
    const record: Fixture | undefined = records.find(
      (candidate: Fixture): boolean => candidate['_id'] === id,
    );
    return record
      ? json(route, ok(record))
      : json(
          route,
          JSON.stringify({
            statusCode: 404,
            success: false,
            message: 'Not found',
            data: null,
          }),
          404,
        );
  }

  if (method === 'GET' && !id) {
    return json(
      route,
      ok(
        resource === 'subscriptions'
          ? subscriptionsPage(records)
          : page1(records),
      ),
    );
  }

  // Sub-resources (e.g. `sub-topics/:id/articles`) and anything else.
  return json(route, ok(page1([])));
}

/**
 * Stubs the gateway for an authenticated umdzidzisi-admin session backed by
 * `fixtures`. Call before `page.goto`.
 */
export async function stubLmsGateway(
  page: Page,
  fixtures: GatewayFixtures = {},
): Promise<GatewayStub> {
  const stub: GatewayStub = { requests: [] };

  await page.route(
    (url: URL): boolean => segmentsAfter(USER_MANAGEMENT, url) !== null,
    (route: Route): Promise<void> => {
      const segments: string[] =
        segmentsAfter(USER_MANAGEMENT, new URL(route.request().url())) ?? [];
      const path: string = segments.join('/');
      if (path === 'authentications/refresh-token') {
        return json(route, ok(SESSION));
      }
      if (path === 'authentications/my-permissions') {
        return json(
          route,
          ok({
            roleId: 'role-1',
            roleName: 'Content Manager',
            permissions: ['read'],
            deviceId: 'device-1',
          }),
        );
      }
      if (path === 'system-users') {
        return json(
          route,
          ok(page1([SYSTEM_USER, ...(fixtures.systemUsers ?? [])])),
        );
      }
      return json(route, ok(page1([])));
    },
  );

  for (const [service, records] of [
    [LEARNING_MANAGEMENT, fixtures.lms ?? {}],
    [CONTENT_MANAGEMENT, fixtures.cms ?? {}],
  ] as [string, Record<string, Fixture[]>][]) {
    await page.route(
      (url: URL): boolean => segmentsAfter(service, url) !== null,
      (route: Route): Promise<void> => {
        stub.requests.push(route.request());
        const segments: string[] =
          segmentsAfter(service, new URL(route.request().url())) ?? [];
        return answerResource(route, segments, records);
      },
    );
  }

  return stub;
}

/** Matches an LMS request for `resource` (any query string), optionally by method. */
export function isLmsRequest(
  resource: string,
  method: string = 'GET',
): (request: Request) => boolean {
  return (request: Request): boolean =>
    request.method() === method &&
    new URL(request.url()).pathname.endsWith(
      `/${LEARNING_MANAGEMENT}/${resource}`,
    );
}
