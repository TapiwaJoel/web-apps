# Frontend HTTP Services & DTOs — Design

**Date:** 2026-08-10
**Status:** Approved (design), pending implementation plan
**Scope of this pass:** Auth + `user-management-service`. The other six backend
services are documented as a replication pattern only.

## Context

The `web-apps` Nx/Angular workspace currently has **no real HTTP layer**. The only
"data-access" code is a **mock** `AuthService`
(`libs/data-access-auth/src/lib/services/auth.service.ts`) that returns `of(...)`
with `delay()` and never touches a backend. No `apiUrl` is configured anywhere —
the environment files only describe micro-frontend `remoteEntry.json` URLs.

The `backend-services` repo (`@backend-services/source`) exposes a large REST API:
**~50 controllers and 200+ DTO files across 7 services** (NestJS 11 on Fastify,
fronted by an API-gateway reverse proxy). Every request/response DTO is centralized
in `libs/commons-lib/src/lib/dtos/<domain>/<resource>/*.dto.ts` and every response is
wrapped in a `ServiceResponse<T>` envelope (lists in `ServiceResponse<PaginateResult<T>>`).

We need real Angular HTTP services with matching request/response DTOs so the
frontend can talk to the gateway. The surface is too large to build all at once, so
this pass establishes the **foundation + the full `user-management-service`
integration** (including replacing the mock login with a real, cookie-authenticated
login), and documents the exact pattern to replicate for the remaining services.

**Intended outcome:** a real, typed, cookie-authenticated HTTP layer where a user can
log in through the shell against the running gateway, `currentUser` populates from the
backend, and every user-management endpoint is callable through a typed service.

## Key backend facts that shape the design

- **Gateway is a catch-all proxy.** It takes the first URL segment as the service
  name and forwards the rest: `POST {gateway}/user-management-service/authentications/login`.
  There is **no** global `/api` prefix on runtime services.
- **Auth = JWT in httpOnly cookies** (Bearer is only a fallback). The web client
  therefore uses `withCredentials: true` + an `X-Client-Type: web` header, and
  **cannot read the token in JS**. Login/refresh/change-password responses come back
  as `Omit<AuthenticationResponseDto, 'accessToken' | 'refreshToken'>`.
- **`ServiceResponse<T>`** = `{ statusCode: number; success: boolean; message: string; data: T }`.
- **`PaginateResult<T>`** = `{ docs: T[]; totalDocs; limit; page?; totalPages;
  hasNextPage; nextPage?; hasPrevPage; prevPage?; pagingCounter }`.
- DTOs use backend-only decorators (`@ApiProperty`, class-validator, `@AutoMap`) and
  Mongoose `Types.ObjectId`. **Frontend mirrors are plain TS interfaces**:
  `Types.ObjectId → string`, `Date → string` (ISO), all decorators dropped, field
  names/optionality preserved.

## Nx module-boundary constraint (drives the lib layout)

`eslint.config.mjs` enforces `@nx/enforce-module-boundaries`:

- `type:data-access` may **only** depend on `type:util`.
- `type:ui` may only depend on `type:util`.
- `scope:*` app tags may only depend on `scope:shared`.

Consequence: a data-access lib **cannot** import DTOs from a `type:data` lib (the
current `libs/models`). DTOs must live in a **`type:util`** lib so both data-access
services and apps can import them.

## Architecture

### 1. `libs/api-contracts` — NEW lib (`scope:shared`, `type:util`)

Alias `@mushaviri/api-contracts`. Plain-TS mirror of the backend `commons-lib/dtos`
tree — the single source of truth for request/response shapes.

```
libs/api-contracts/src/lib/
  common/
    service-response.ts        # ServiceResponse<T>
    paginate-result.ts         # PaginateResult<T>
    pagination-params.ts       # PaginationParams (page, limit, sort)
  user-management/
    enums/                     # UserType, UserStatus, LogoutScope, AccountRecoveryType, VerificationChannels, ... (TS union types / const objects)
    authentication/            # login.dto, logout-request.dto, authentication-response.dto, token-info.dto,
                               #   user-permissions-response.dto, account-recovery.dto, change-password.dto, session-metadata.dto
    users/                     # create-user.dto, update-user.dto, change-contact.dto, get-users-query.dto, user-response.dto
    system-users/, roles/, permissions/, role-permissions/,
    verifications/, devices/, countries/, audit-trail/, authentication-settings/
  index.ts                     # root barrel; each folder also has its own index.ts
```

Conventions (match the workspace): files `*.dto.ts` for DTOs, `*.ts` for
enums/common; PascalCase interfaces, no `I` prefix; barrel `index.ts` per folder.

> Note: the workspace already has `ApiResponse<T>` / `PaginatedResponse<T>` in
> `libs/models`. Those are **not** the backend envelope shape and are unused by HTTP
> code. We do **not** reuse them; the canonical envelope is `ServiceResponse<T>` /
> `PaginateResult<T>` in `api-contracts`.

### 2. `libs/data-access-user-management` — NEW lib (`scope:shared`, `type:data-access`)

Alias `@mushaviri/data-access-user-management`. One Angular service per backend
controller. Each service is a thin `HttpClient` wrapper following the existing house
style (`@Injectable({ providedIn: 'root' })`, `inject(HttpClient)`, explicit return
types, RxJS `map(r => r.data)` to unwrap the envelope, `catchError` for typed errors).

```
libs/data-access-user-management/src/lib/
  core/
    api-config.ts              # API_BASE_URL InjectionToken + USER_MANAGEMENT_PATH constant
    build-url.ts               # buildUrl(base, servicePath, controllerPath, ...segments)
    map-http-error.ts          # normalize HttpErrorResponse -> { statusCode, message }
  services/
    authentication.service.ts  # /authentications: login, logout, refreshToken, myPermissions, changePassword, accountRecovery
    users.service.ts           # /users: create, update, changeContact, list(query -> paginated)
    system-users.service.ts    # /system-users
    roles.service.ts           # /roles
    permissions.service.ts     # /permissions
    role-permissions.service.ts# /role-permissions
    verifications.service.ts   # /verifications: verify, resend
    devices.service.ts         # /devices
    countries.service.ts       # /countries
    audit-trail.service.ts     # /audit-trail: me, list
    authentication-settings.service.ts # /authentication-settings
  index.ts
```

`buildUrl` composes `{apiBaseUrl}/user-management-service/{controllerPath}`. List
endpoints return `ServiceResponse<PaginateResult<T>>`; services expose the unwrapped
`PaginateResult<T>` (or `T`/`T[]`).

Because this lib is `type:data-access`, it imports DTOs from `@mushaviri/api-contracts`
(`type:util`) — allowed — and must **not** import from `@mushaviri/models` (`type:data`)
or `@mushaviri/ui-common` (`type:ui`).

### 3. Shared HTTP plumbing (extend existing `libs/data-access-auth`)

`data-access-auth` is `scope:shared`, `type:data-access`, so it may depend on
`api-contracts` (`type:util`). We extend it rather than adding a new auth lib.

- **`apiInterceptor`** (new functional `HttpInterceptorFn`): for requests to the API
  base URL, set `withCredentials: true` and add `X-Client-Type: web`. Does **not** add
  a Bearer header (httpOnly cookies carry the JWT). Replaces the token-adding behavior
  of the existing `authInterceptor` for API calls.
- **`AuthService` rewrite** (real, replacing the mock):
  - `login({ email, password })` → maps `email → identifier`, delegates to
    `AuthenticationService.login`, stores `data.user` / `data.systemUser` in signals.
    No token stored in JS (it's in the cookie).
  - `checkAuth()` → calls an authenticated endpoint (`GET /authentications/my-permissions`)
    to detect a valid cookie session; populates signals on success, returns `false` on 401.
  - `logout()` → `POST /authentications/logout`, clears signals, delegates cookie
    clearing to the backend.
  - `refreshToken()` → `POST /authentications/refresh-token`.
- **`TokenService`**: no longer the source of the access token (cookie is). Retained only
  if needed for non-token client state; its Bearer plumbing is superseded by `apiInterceptor`.
  The existing `authInterceptor` Bearer logic is removed/replaced.

### 4. Environment + config wiring

- Extend the `Environment` interface in each shell app's env files
  (`apps/shell/{admin,web,client}/src/environments/*.ts`) with `apiBaseUrl`.
  - dev (`environment.ts`): `http://localhost:3000`
  - prod (`environment.prod.ts`): `https://api.mushaviri.com:8443`
- In each shell `app.config.ts`: provide `{ provide: API_BASE_URL, useValue: environment.apiBaseUrl }`
  and register `apiInterceptor` in `provideHttpClient(withInterceptors([apiInterceptor]))`
  (replacing/augmenting the current `authInterceptor`).
- **Only the three shell apps provide `HttpClient` and host login.** The six remote
  apps do not do auth and are out of scope for this pass. If a remote later needs
  direct API calls, it must add `provideHttpClient` + the token/interceptor itself.

## Data flow — login (worked example)

```
LoginComponent.onSubmit()
  → AuthService.login({ email, password })                 (libs/data-access-auth)
  → AuthenticationService.login({ identifier, password })  (libs/data-access-user-management)
  → POST {gateway}/user-management-service/authentications/login
        headers: X-Client-Type: web ; withCredentials: true
  ← backend sets httpOnly cookies (accessToken, refreshToken)
  ← ServiceResponse<Omit<AuthenticationResponseDto,'accessToken'|'refreshToken'>>
  → map(r => r.data)  → AuthService sets currentUser / systemUser signals
  → LoginComponent navigates (returnUrl or SmartNavigationService)
```

## Error handling

- Each service pipes `catchError(mapHttpError)` → normalized `{ statusCode, message }`
  (message sourced from `ServiceResponse.message` when present).
- 401 on a non-login call → attempt `refreshToken()` once; on failure delegate to the
  existing `LogoutService` (clear signals + redirect to `/login`).
- CSRF: user-management registers `@fastify/csrf-protection`. During integration,
  verify whether cookie-based POST/PATCH needs a CSRF token header; if so, add it in
  `apiInterceptor`. Flagged as an integration checkpoint, not a blocker for the design.

## Testing / verification

- **Unit (per service):** `HttpTestingController` specs asserting URL, method,
  `X-Client-Type: web`, `withCredentials`, request body mapping (`email → identifier`),
  and that responses unwrap `ServiceResponse.data` (and `PaginateResult` for lists).
- **AuthService specs:** login populates `currentUser`; `checkAuth` returns false on 401;
  logout clears signals.
- **End-to-end check:** run the gateway + user-management-service locally, log in from
  the shell, confirm the httpOnly cookie is set (DevTools/Network) and `currentUser`
  populates. Document the manual steps and a `curl` equivalent for the login endpoint.
- Run through `nx`: `npm exec nx test data-access-user-management`,
  `npm exec nx test data-access-auth`, `npm exec nx lint api-contracts`
  (lint must pass with no module-boundary violations).

## Out of scope this pass — replication guide for the other 6 services

Not built now; documented so the pattern repeats mechanically. For each remaining
service create `libs/data-access-<svc>` (`scope:shared`, `type:data-access`) + a
`libs/api-contracts/<domain>/` subtree, mirroring the structure above. Controller →
base-path map (all relative to `{gateway}/<service-name>/`):

- **content-management-service:** `articles`, `comments`, `questions`, `reactions`,
  `content-progress`, `resources`, `live-streams` (CRUD: GET / POST / PATCH :id, plus
  reaction/bookmark sub-routes).
- **learning-management-service:** `topics`, `sub-topics`, `subjects`, `grades`,
  `grading-systems`, `grading-scales`, `educational-levels`, `examination-boards`,
  `examination-papers`, `examinations`, `assessments`, `profiles`, `subscription-plans`,
  `subscriptions` (consistent POST create / PATCH :id / GET list).
- **messaging-service:** `email` (POST), `sms` (POST /send), `push` (POST),
  `channels` (GET); Socket.IO proxied separately.
- **payment-gateway-service:** `payments` (POST, GET, POST /paynow), `providers` (GET).
- **configuration-service:** `service-configs` (GET, GET /files/:type/:filename) —
  mostly service-to-service; only add if the frontend needs config download.

DTO sources to mirror: `libs/commons-lib/src/lib/dtos/{content-management,
learning-management,messaging,payment-gateway}/**` in `backend-services`.

## Critical files

**New (frontend):**
- `libs/api-contracts/**` (new lib)
- `libs/data-access-user-management/**` (new lib)
- `libs/data-access-auth/src/lib/interceptors/api.interceptor.ts` (new)

**Modified (frontend):**
- `libs/data-access-auth/src/lib/services/auth.service.ts` (mock → real)
- `libs/data-access-auth/src/index.ts` (export apiInterceptor)
- `apps/shell/{admin,web,client}/src/environments/*.ts` (+`apiBaseUrl`)
- `apps/shell/{admin,web,client}/src/app/app.config.ts` (API_BASE_URL + apiInterceptor)
- `apps/shell/admin/src/app/login/login.component.ts` (works unchanged; verify email→identifier mapping lives in AuthService)
- `tsconfig.base.json` (+2 path aliases)

**Backend references (read-only, source of DTO shapes):**
- `backend-services/libs/commons-lib/src/lib/dtos/user-management/**`
- `backend-services/libs/commons-lib/src/lib/data/models/common/dtos/service-response.ts`
- `backend-services/libs/commons-lib/src/lib/data/models/common/interfaces/paginate-result.ts`
- `backend-services/apps/user-management-service/src/app/infrastructure/http/controllers/*.controller.ts`
