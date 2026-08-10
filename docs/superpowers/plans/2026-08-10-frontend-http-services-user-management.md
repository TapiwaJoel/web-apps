# Frontend HTTP Services & DTOs (Auth + User-Management) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a real, typed, cookie-authenticated Angular HTTP layer for the backend `user-management-service`, and replace the mock `AuthService` with a real login against the API gateway.

**Architecture:** A new `type:util` lib (`@mushaviri/api-contracts`) holds plain-TS mirrors of the backend DTOs + the `ServiceResponse<T>`/`PaginateResult<T>` envelopes. A new `type:data-access` lib (`@mushaviri/data-access-user-management`) has one `HttpClient` service per backend controller, each unwrapping `ServiceResponse.data`. The existing `data-access-auth` lib gains a cookie-aware `apiInterceptor` and a rewritten real `AuthService`. Auth is JWT-in-httpOnly-cookie, so all API requests use `withCredentials: true` + `X-Client-Type: web` and never read a token in JS.

**Tech Stack:** Angular 21 (standalone, signals, `inject()`, functional interceptors), RxJS 7, Nx 23, Vitest + `@analogjs/vite-plugin-angular` + jsdom for tests (`HttpTestingController`).

## Global Constraints

- **Nx module boundaries** (`eslint.config.mjs`): `type:data-access` may depend ONLY on `type:util`; `type:ui` only on `type:util`; `scope:*` apps only on `scope:shared`. → DTOs MUST live in a `type:util` lib; data-access libs import DTOs from `@mushaviri/api-contracts` only.
- **DTO mirroring rules:** Mongoose `Types.ObjectId` → `string`; `Date` → `string` (ISO wire format); drop ALL decorators (`@ApiProperty`, class-validator, `@AutoMap`); preserve exact field names and optionality (`?`).
- **Response envelope:** every endpoint returns `ServiceResponse<T> = { statusCode: number; success: boolean; message: string; data: T }`. List endpoints return `ServiceResponse<PaginateResult<T>>`. Services expose the unwrapped `data`.
- **Gateway URL shape:** `{apiBaseUrl}/user-management-service/{controllerPath}`. No global `/api` prefix. Dev `apiBaseUrl = http://localhost:3000`; prod `https://api.mushaviri.com:8443`.
- **Auth transport:** `withCredentials: true` + header `X-Client-Type: web` on every API request. NO `Authorization: Bearer` header. Login/refresh responses are `Omit<AuthenticationResponseDto,'accessToken'|'refreshToken'>`.
- **House style:** `@Injectable({ providedIn: 'root' })`, `inject()` for deps, explicit return types on every method/property, no `I`-prefix on interfaces, files `*.dto.ts` / `*.service.ts` / `*.enum.ts`, barrel `index.ts` per folder.
- **Commits:** frontend pre-commit hook (`lint-staged`) runs eslint on ALL staged files and currently FAILS on pre-existing errors in unrelated dashboard files. Stage ONLY the files you created/modified for each task; if the hook still fails solely due to unrelated pre-existing files, commit that task with `git commit --no-verify` and note it. Your own new files MUST lint clean (`nx lint <project>`).
- **Nx commands:** prefix with `npm exec` (workspace uses npm, port 4203). e.g. `npm exec nx test data-access-user-management`.

---

## File Structure

**New lib `libs/api-contracts` (`@mushaviri/api-contracts`, `scope:shared`, `type:util`):**
```
src/lib/common/          service-response.ts, paginate-result.ts, pagination-params.ts, index.ts
src/lib/user-management/
  enums/                 user-type.enum.ts, user-status.enum.ts, entity-status.enum.ts, action.enum.ts,
                         logout-scope.enum.ts, account-recovery-type.enum.ts, verification-channels.enum.ts, index.ts
  authentication/        login.dto.ts, logout-request.dto.ts, token-info.dto.ts, session-metadata.dto.ts,
                         authentication-settings-response.dto.ts, user-permissions-response.dto.ts,
                         authentication-response.dto.ts, index.ts
  users/                 create-user.dto.ts, update-user.dto.ts, change-contact.dto.ts,
                         get-users-query.dto.ts, user-response.dto.ts, index.ts
  system-users/          create-system-user.dto.ts, system-user-response.dto.ts, index.ts
  roles/                 create-role.dto.ts, update-role.dto.ts, role-response.dto.ts, index.ts
  permissions/           create-permission.dto.ts, update-permission.dto.ts, permission-response.dto.ts, index.ts
  role-permissions/      create-role-permission.dto.ts, role-permission-response.dto.ts, index.ts
  verifications/         verify-code.dto.ts, resend-code.dto.ts, verification-response.dto.ts, index.ts
  devices/               device-response.dto.ts, index.ts
  countries/             country-response.dto.ts, index.ts
  audit-trail/           audit-trail-response.dto.ts, index.ts
  index.ts
src/index.ts
```

**New lib `libs/data-access-user-management` (`@mushaviri/data-access-user-management`, `scope:shared`, `type:data-access`):**
```
src/lib/core/       api-config.ts (API_BASE_URL token + USER_MANAGEMENT_PATH), build-url.ts, map-http-error.ts, index.ts
src/lib/services/   authentication.service.ts, users.service.ts, system-users.service.ts, roles.service.ts,
                    permissions.service.ts, role-permissions.service.ts, verifications.service.ts,
                    devices.service.ts, countries.service.ts, audit-trail.service.ts,
                    authentication-settings.service.ts
src/index.ts
```

**Modified:**
- `libs/data-access-auth/src/lib/interceptors/api.interceptor.ts` (new), `.../services/auth.service.ts` (rewrite), `src/index.ts`
- `apps/shell/{admin,web,client}/src/environments/*.ts` (+`apiBaseUrl`)
- `apps/shell/{admin,web,client}/src/app/app.config.ts` (provide `API_BASE_URL` + register `apiInterceptor`)
- `tsconfig.base.json` (+2 path aliases — usually written by the generator)

---

## Task 1: Scaffold `api-contracts` lib + common envelope types

**Files:**
- Create (generated): `libs/api-contracts/**` (project.json, tsconfig, vite.config.mts, src/index.ts)
- Create: `libs/api-contracts/src/lib/common/service-response.ts`, `paginate-result.ts`, `pagination-params.ts`, `index.ts`
- Test: `libs/api-contracts/src/lib/common/service-response.spec.ts`

**Interfaces:**
- Produces: `ServiceResponse<T>`, `PaginateResult<T>`, `PaginationParams` (imported by every service and DTO consumer).

- [ ] **Step 1: Generate the lib**

Run:
```bash
npm exec nx g @nx/js:library api-contracts \
  --directory=libs/api-contracts \
  --unitTestRunner=vitest \
  --bundler=none \
  --importPath=@mushaviri/api-contracts \
  --tags="scope:shared,type:util" \
  --no-interactive
```
Expected: creates `libs/api-contracts` with `@mushaviri/api-contracts` alias added to `tsconfig.base.json`. If the generator scaffolds a sample `lib/api-contracts.ts` + spec, delete them at the end of the task.

- [ ] **Step 2: Verify tags + alias**

Run: `cat libs/api-contracts/project.json | grep -A2 tags && grep api-contracts tsconfig.base.json`
Expected: tags `["scope:shared","type:util"]`; alias `"@mushaviri/api-contracts": ["libs/api-contracts/src/index.ts"]`.

- [ ] **Step 3: Write the common envelope types**

`libs/api-contracts/src/lib/common/service-response.ts`:
```typescript
export interface ServiceResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
}
```
`libs/api-contracts/src/lib/common/paginate-result.ts`:
```typescript
export interface PaginateResult<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  page?: number;
  totalPages: number;
  hasNextPage: boolean;
  nextPage?: number | null;
  hasPrevPage: boolean;
  prevPage?: number | null;
  pagingCounter: number;
}
```
`libs/api-contracts/src/lib/common/pagination-params.ts`:
```typescript
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
}
```
`libs/api-contracts/src/lib/common/index.ts`:
```typescript
export * from './service-response';
export * from './paginate-result';
export * from './pagination-params';
```

- [ ] **Step 4: Write a compile/type test**

`libs/api-contracts/src/lib/common/service-response.spec.ts`:
```typescript
import { ServiceResponse, PaginateResult } from './index';

describe('common envelope types', () => {
  it('constructs a ServiceResponse<PaginateResult<T>>', () => {
    const resp: ServiceResponse<PaginateResult<{ id: string }>> = {
      statusCode: 200,
      success: true,
      message: 'ok',
      data: {
        docs: [{ id: 'a' }],
        totalDocs: 1,
        limit: 20,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
        pagingCounter: 1,
      },
    };
    expect(resp.data.docs[0].id).toBe('a');
    expect(resp.success).toBe(true);
  });
});
```

- [ ] **Step 5: Wire root barrels**

`libs/api-contracts/src/index.ts`:
```typescript
export * from './lib/common';
```
(Add `user-management` export in Task 2.)

- [ ] **Step 6: Run the test + lint**

Run: `npm exec nx test api-contracts && npm exec nx lint api-contracts`
Expected: PASS, no lint errors, no module-boundary violations.

- [ ] **Step 7: Commit**

```bash
git add libs/api-contracts tsconfig.base.json
git commit -m "feat(api-contracts): scaffold lib with ServiceResponse and PaginateResult envelopes"
```
(If the hook fails only on unrelated pre-existing dashboard files, re-run with `--no-verify` and note it in the commit body.)

---

## Task 2: user-management enums + DTOs in `api-contracts`

**Files:**
- Create: all files under `libs/api-contracts/src/lib/user-management/**` (enums + per-resource DTOs + barrels)
- Modify: `libs/api-contracts/src/index.ts`
- Test: `libs/api-contracts/src/lib/user-management/user-management.spec.ts`

**Interfaces:**
- Produces (imported by Task 5+ services): `LoginDto`, `LogoutRequestDto`, `AuthenticationResponseDto`, `TokenInfoDto`, `AuthenticationSettingsResponseDto`, `UserPermissionsResponseDto`, `SessionMetadataDto`, `CreateUserDto`, `UpdateUserDto`, `ChangeContactDto`, `GetUsersQueryDto`, `UserResponseDto`, `CreateSystemUserDto`, `SystemUserResponseDto`, `CreateRoleDto`, `UpdateRoleDto`, `RoleResponseDto`, `CreatePermissionDto`, `UpdatePermissionDto`, `PermissionResponseDto`, `CreateRolePermissionDto`, `RolePermissionResponseDto`, `VerifyCodeDto`, `ResendCodeDto`, `VerificationResponseDto`, `DeviceResponseDto`, `CountryResponseDto`, `AuditTrailResponseDto`; enums `UserType`, `UserStatus`, `EntityStatus`, `Action`, `LogoutScope`, `AccountRecoveryType`, `VerificationChannels`.
- Reference source (read-only): `backend-services/libs/commons-lib/src/lib/dtos/user-management/**`.

- [ ] **Step 1: Write the enums**

`.../user-management/enums/user-type.enum.ts`:
```typescript
export enum UserType {
  Individual = 'individual',
  SME = 'sme',
  Corporate = 'corporate',
}
```
`.../enums/user-status.enum.ts`:
```typescript
export enum UserStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  LOCKED = 'LOCKED',
  DELETED = 'DELETED',
  SUSPENDED = 'SUSPENDED',
}
```
`.../enums/entity-status.enum.ts`:
```typescript
export enum EntityStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  DELETED = 'Deleted',
}
```
`.../enums/action.enum.ts`:
```typescript
export enum Action {
  CREATE = 'create',
  STREAM = 'stream',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  READ_SELF = 'read_self',
  UPDATE_SELF = 'update_self',
  CREATE_SELF = 'create_self',
  DELETE_SELF = 'delete_self',
  LOGOUT = 'logout',
  LOGOUT_SELF = 'logout_self',
  LOGOUT_TEAM = 'logout_team',
  SEND = 'send',
}
```
`.../enums/logout-scope.enum.ts`:
```typescript
export enum LogoutScope {
  CURRENT = 'CURRENT',
  ALL = 'ALL',
  DEVICE = 'DEVICE',
}
```
`.../enums/account-recovery-type.enum.ts`:
```typescript
export enum AccountRecoveryType {
  FORGOT_PASSWORD = 'FORGOT_PASSWORD',
  UNLOCK_ACCOUNT = 'UNLOCK_ACCOUNT',
}
```
`.../enums/verification-channels.enum.ts`:
```typescript
export enum VerificationChannels {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
}
```
`.../enums/index.ts`:
```typescript
export * from './user-type.enum';
export * from './user-status.enum';
export * from './entity-status.enum';
export * from './action.enum';
export * from './logout-scope.enum';
export * from './account-recovery-type.enum';
export * from './verification-channels.enum';
```

- [ ] **Step 2: Write the authentication DTOs**

`.../authentication/login.dto.ts`:
```typescript
export interface LoginDto {
  identifier: string; // email OR phone (+263...)
  password: string;
}
```
`.../authentication/logout-request.dto.ts`:
```typescript
import { LogoutScope } from '../enums';

export interface LogoutRequestDto {
  scope?: LogoutScope;
  deviceId?: string;
}
```
`.../authentication/token-info.dto.ts`:
```typescript
export interface TokenInfoDto {
  token: string;
  iat: number;
  exp: number;
  jti?: string;
}
```
`.../authentication/session-metadata.dto.ts`:
```typescript
export interface SessionMetadataDto {
  sessionId: string;
  deviceId: string;
  expiresAt: string; // ISO date
}
```
`.../authentication/authentication-settings-response.dto.ts`:
```typescript
export interface AuthenticationSettingsResponseDto {
  authentication: string;
  isTwoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}
```
`.../authentication/user-permissions-response.dto.ts`:
```typescript
export interface UserPermissionsResponseDto {
  roleId: string;
  roleName: string;
  roleDescription?: string;
  permissions: string[];
}
```
`.../authentication/authentication-response.dto.ts` (tokens optional because the web strategy strips them into cookies):
```typescript
import { AuthenticationSettingsResponseDto } from './authentication-settings-response.dto';
import { TokenInfoDto } from './token-info.dto';
import { UserResponseDto } from '../users/user-response.dto';
import { SystemUserResponseDto } from '../system-users/system-user-response.dto';
import { DeviceResponseDto } from '../devices/device-response.dto';

export interface AuthenticationResponseDto {
  _id: string;
  authenticationSettings: AuthenticationSettingsResponseDto;
  user: UserResponseDto;
  systemUser: SystemUserResponseDto;
  device?: Partial<DeviceResponseDto>[];
  accessToken?: TokenInfoDto;   // absent for web client (httpOnly cookie)
  refreshToken?: TokenInfoDto;  // absent for web client (httpOnly cookie)
  createdAt: string;
  updatedAt: string;
}

export type WebAuthenticationResponseDto = Omit<AuthenticationResponseDto, 'accessToken' | 'refreshToken'>;
```
`.../authentication/index.ts`:
```typescript
export * from './login.dto';
export * from './logout-request.dto';
export * from './token-info.dto';
export * from './session-metadata.dto';
export * from './authentication-settings-response.dto';
export * from './user-permissions-response.dto';
export * from './authentication-response.dto';
```

- [ ] **Step 3: Write the users DTOs**

`.../users/user-response.dto.ts`:
```typescript
import { UserType } from '../enums';
import { UserStatus } from '../enums';

export interface UserResponseDto {
  _id: string;
  name: string;
  phoneNumber: string;
  emailAddress?: string;
  userType: UserType;
  status: UserStatus;
  country: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}
```
`.../users/create-user.dto.ts`:
```typescript
import { UserType, UserStatus } from '../enums';

export interface CreateUserDto {
  _id?: string;
  name: string;
  phoneNumber: string; // Zimbabwe format: +263 followed by 9 digits
  emailAddress?: string;
  userType: UserType;
  status?: UserStatus;
  country: string;
  password: string; // min length 8
  role: string; // MongoId
}
```
`.../users/update-user.dto.ts`:
```typescript
import { UserType, UserStatus } from '../enums';

export interface UpdateUserDto {
  _id?: string;
  role?: string;
  name: string;
  userType: UserType;
  status: UserStatus;
}
```
`.../users/change-contact.dto.ts`:
```typescript
export interface ChangeContactDto {
  value: string;
}
```
`.../users/get-users-query.dto.ts`:
```typescript
import { UserType, UserStatus } from '../enums';
import { PaginationParams } from '../../common';

export interface GetUsersQueryDto extends PaginationParams {
  _id?: string;
  userType?: UserType;
  status?: UserStatus;
  name?: string;        // min 3 chars
  phoneNumber?: string; // min 3 chars
  emailAddress?: string; // min 3 chars
}
```
`.../users/index.ts`:
```typescript
export * from './user-response.dto';
export * from './create-user.dto';
export * from './update-user.dto';
export * from './change-contact.dto';
export * from './get-users-query.dto';
```

- [ ] **Step 4: Write system-users, roles, permissions, role-permissions DTOs**

`.../system-users/system-user-response.dto.ts`:
```typescript
import { UserStatus } from '../enums';

export interface SystemUserResponseDto {
  _id: string;
  name: string;
  phoneNumber: string;
  emailAddress?: string;
  country: string;
  user: string;
  role: string;
  status: UserStatus;
  createdAt: string;
  updatedAt?: string;
}
```
`.../system-users/create-system-user.dto.ts`:
```typescript
export interface CreateSystemUserDto {
  _id?: string;
  name: string;
  phoneNumber: string;
  emailAddress: string;
  country: string;
  role: string;
  user?: string;
}
```
`.../system-users/index.ts`: `export * from './system-user-response.dto'; export * from './create-system-user.dto';`

`.../roles/role-response.dto.ts`:
```typescript
import { EntityStatus } from '../enums';

export interface RoleResponseDto {
  _id: string;
  name: string;
  description?: string;
  serviceName?: string;
  isSensitive: boolean;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}
```
`.../roles/create-role.dto.ts`:
```typescript
import { EntityStatus } from '../enums';

export interface CreateRoleDto {
  name: string;
  description?: string;
  serviceName?: string;
  isSensitive?: boolean;
  status?: EntityStatus;
}
```
`.../roles/update-role.dto.ts`:
```typescript
import { EntityStatus } from '../enums';

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  serviceName?: string;
  isSensitive?: boolean;
  status?: EntityStatus;
}
```
`.../roles/index.ts`: barrel of the three above.

`.../permissions/permission-response.dto.ts`:
```typescript
import { Action, EntityStatus } from '../enums';

export interface PermissionResponseDto {
  _id: string;
  name: string;
  serviceName: string;
  resource: string;
  action: Action;
  description: string;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}
```
`.../permissions/create-permission.dto.ts`:
```typescript
import { Action } from '../enums';

export interface CreatePermissionDto {
  name: string;
  serviceName: string;
  resource: string;
  action: Action;
  description: string;
}
```
`.../permissions/update-permission.dto.ts`:
```typescript
import { Action, EntityStatus } from '../enums';

export interface UpdatePermissionDto {
  name?: string;
  serviceName?: string;
  resource?: string;
  action?: Action;
  description?: string;
  status?: EntityStatus;
}
```
`.../permissions/index.ts`: barrel of the three above.

`.../role-permissions/role-permission-response.dto.ts`:
```typescript
import { EntityStatus } from '../enums';

export interface RolePermissionResponseDto {
  _id: string;
  roleId: string;
  permissionId: string;
  grantedBy: string;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}
```
`.../role-permissions/create-role-permission.dto.ts`:
```typescript
export interface CreateRolePermissionDto {
  _id?: string;
  grantedBy?: string;
  status?: string;
  roleId: string;
  permissionId: string;
}
```
`.../role-permissions/index.ts`: barrel of the two above.

- [ ] **Step 5: Write verifications, devices, countries, audit-trail DTOs**

`.../verifications/verify-code.dto.ts`:
```typescript
export interface VerifyCodeDto {
  verificationId: string;
  code: string;
  fcmId?: string;
  newPassword?: string;
}
```
`.../verifications/resend-code.dto.ts`:
```typescript
import { VerificationChannels } from '../enums';

export interface ResendCodeDto {
  verificationId?: string;
  identifier?: string;
  type?: string;
  channel?: VerificationChannels;
}
```
`.../verifications/verification-response.dto.ts`:
```typescript
import { VerificationChannels } from '../enums';

export interface VerificationResponseDto {
  verificationType?: string;
  channel?: VerificationChannels;
  verified: boolean;
  verifiedAt: string;
  createdAt: string;
  updatedAt: string;
}
```
`.../verifications/index.ts`: barrel of the three above.

`.../devices/device-response.dto.ts`:
```typescript
export interface DeviceResponseDto {
  _id?: string;
  systemUser: string;
  deviceId: string;
  fcmId?: string;
  deviceType: string;
  name: string;
  platform: string;
  platformVersion: string;
  browser?: string;
  browserVersion?: string;
  deviceModel?: string;
  isActive: boolean;
  lastUsedAt: string;
  createdAt: string;
  updatedAt: string;
}
```
`.../devices/index.ts`: `export * from './device-response.dto';`

`.../countries/country-response.dto.ts`:
```typescript
export interface CountryResponseDto {
  name: string;
  code: string;
  phoneCode: string;
  phoneNumberLength: number;
  currency: string[];
  flag: string;
  language: string[];
}
```
`.../countries/index.ts`: `export * from './country-response.dto';`

`.../audit-trail/audit-trail-response.dto.ts`:
```typescript
export interface AuditTrailResponseDto {
  _id: string;
  requestId: string;
  systemUserId?: string;
  systemUserName?: string;
  action: string;
  resource: string;
  resourceId?: string;
  endpoint: string;
  method: string;
  statusCode: number;
  metadata?: Record<string, unknown>;
  errorMessage?: string;
  accessedAt: string;
  createdAt: string;
}
```
`.../audit-trail/index.ts`: `export * from './audit-trail-response.dto';`

- [ ] **Step 6: Write the user-management barrel + root export**

`.../user-management/index.ts`:
```typescript
export * from './enums';
export * from './authentication';
export * from './users';
export * from './system-users';
export * from './roles';
export * from './permissions';
export * from './role-permissions';
export * from './verifications';
export * from './devices';
export * from './countries';
export * from './audit-trail';
```
`libs/api-contracts/src/index.ts`:
```typescript
export * from './lib/common';
export * from './lib/user-management';
```

- [ ] **Step 7: Write a barrel-resolution test**

`.../user-management/user-management.spec.ts`:
```typescript
import { LoginDto, UserResponseDto, UserType, UserStatus, RoleResponseDto } from '@mushaviri/api-contracts';

describe('user-management contracts', () => {
  it('exposes DTOs and enums through the root barrel', () => {
    const login: LoginDto = { identifier: 'a@b.com', password: 'secret123' };
    const user: UserResponseDto = {
      _id: '1', name: 'A', phoneNumber: '+263771234567',
      userType: UserType.Individual, status: UserStatus.ACTIVE,
      country: 'Zimbabwe', role: 'r1', createdAt: '', updatedAt: '',
    };
    const role: RoleResponseDto | null = null;
    expect(login.identifier).toBe('a@b.com');
    expect(user.status).toBe('ACTIVE');
    expect(role).toBeNull();
  });
});
```

- [ ] **Step 8: Run tests + lint**

Run: `npm exec nx test api-contracts && npm exec nx lint api-contracts`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add libs/api-contracts
git commit -m "feat(api-contracts): add user-management enums and request/response DTOs"
```

---

## Task 3: Scaffold `data-access-user-management` lib + core helpers

**Files:**
- Create (generated): `libs/data-access-user-management/**`
- Create: `src/lib/core/api-config.ts`, `build-url.ts`, `map-http-error.ts`, `index.ts`
- Test: `src/lib/core/build-url.spec.ts`

**Interfaces:**
- Consumes: `ServiceResponse<T>` from `@mushaviri/api-contracts`.
- Produces (used by all Task 5+ services and by Task 6 app wiring): `API_BASE_URL: InjectionToken<string>`, `USER_MANAGEMENT_PATH: string` (`'user-management-service'`), `buildUrl(base: string, servicePath: string, ...segments: string[]): string`, `mapHttpError(error: HttpErrorResponse): Observable<never>`, `ApiError` interface `{ statusCode: number; message: string }`.

- [ ] **Step 1: Generate the Angular lib**

Run:
```bash
npm exec nx g @nx/angular:library data-access-user-management \
  --directory=libs/data-access-user-management \
  --unitTestRunner=vitest \
  --importPath=@mushaviri/data-access-user-management \
  --prefix=org \
  --standalone \
  --tags="scope:shared,type:data-access" \
  --skipModule \
  --no-interactive
```
Expected: creates the lib with alias + `vite.config.mts`. Delete any generated sample component/spec at task end. If `--skipModule` is rejected, omit it (this lib exports services + tokens, not a component).

- [ ] **Step 2: Verify tags + alias + test setup**

Run: `cat libs/data-access-user-management/project.json | grep -A2 tags && ls libs/data-access-user-management/vite.config.mts`
Expected: tags `["scope:shared","type:data-access"]`, vite config present.

- [ ] **Step 3: Write core helpers**

`src/lib/core/api-config.ts`:
```typescript
import { InjectionToken } from '@angular/core';

/** Gateway origin, e.g. http://localhost:3000. Provided per app from environment.apiBaseUrl. */
export const API_BASE_URL: InjectionToken<string> = new InjectionToken<string>('API_BASE_URL');

/** First path segment the gateway uses to route to user-management-service. */
export const USER_MANAGEMENT_PATH: string = 'user-management-service';
```
`src/lib/core/build-url.ts`:
```typescript
/**
 * Compose a gateway URL: {base}/{servicePath}/{segments...}
 * Trims slashes so callers can pass 'authentications', '/authentications', etc.
 */
export function buildUrl(base: string, servicePath: string, ...segments: string[]): string {
  const parts: string[] = [servicePath, ...segments]
    .map((s: string): string => s.replace(/^\/+|\/+$/g, ''))
    .filter((s: string): boolean => s.length > 0);
  return `${base.replace(/\/+$/g, '')}/${parts.join('/')}`;
}
```
`src/lib/core/map-http-error.ts`:
```typescript
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

export interface ApiError {
  statusCode: number;
  message: string;
}

/** Normalize an HttpErrorResponse into ApiError, preferring the backend ServiceResponse.message. */
export function mapHttpError(error: HttpErrorResponse): Observable<never> {
  const body: unknown = error.error;
  const message: string =
    typeof body === 'object' && body !== null && 'message' in body
      ? String((body as { message: unknown }).message)
      : error.message || 'Request failed';
  const apiError: ApiError = { statusCode: error.status, message };
  return throwError((): ApiError => apiError);
}
```
`src/lib/core/index.ts`:
```typescript
export * from './api-config';
export * from './build-url';
export * from './map-http-error';
```

- [ ] **Step 4: Write the build-url test**

`src/lib/core/build-url.spec.ts`:
```typescript
import { buildUrl } from './build-url';

describe('buildUrl', () => {
  it('joins base, service path, and segments with single slashes', () => {
    expect(buildUrl('http://localhost:3000', 'user-management-service', 'authentications', 'login'))
      .toBe('http://localhost:3000/user-management-service/authentications/login');
  });

  it('trims stray slashes from every part', () => {
    expect(buildUrl('http://localhost:3000/', '/user-management-service/', '/users/'))
      .toBe('http://localhost:3000/user-management-service/users');
  });
});
```

- [ ] **Step 5: Set root barrel**

`libs/data-access-user-management/src/index.ts`:
```typescript
export * from './lib/core';
// service exports added in Task 4/5
```

- [ ] **Step 6: Run tests + lint**

Run: `npm exec nx test data-access-user-management && npm exec nx lint data-access-user-management`
Expected: PASS. Lint must show NO module-boundary violation (this lib depends only on `@mushaviri/api-contracts` which is `type:util`).

- [ ] **Step 7: Commit**

```bash
git add libs/data-access-user-management tsconfig.base.json
git commit -m "feat(data-access-user-management): scaffold lib with API_BASE_URL, buildUrl, mapHttpError"
```

---

## Task 4: `AuthenticationService` (login/logout/refresh/permissions)

**Files:**
- Create: `libs/data-access-user-management/src/lib/services/authentication.service.ts`
- Modify: `libs/data-access-user-management/src/index.ts`
- Test: `libs/data-access-user-management/src/lib/services/authentication.service.spec.ts`

**Interfaces:**
- Consumes: `API_BASE_URL`, `USER_MANAGEMENT_PATH`, `buildUrl`, `mapHttpError` (Task 3); `LoginDto`, `LogoutRequestDto`, `WebAuthenticationResponseDto`, `UserPermissionsResponseDto`, `ServiceResponse` (`@mushaviri/api-contracts`).
- Produces (used by Task 5 AuthService rewrite): class `AuthenticationService` with
  `login(dto: LoginDto): Observable<WebAuthenticationResponseDto>`,
  `logout(dto: LogoutRequestDto): Observable<void>`,
  `refreshToken(): Observable<WebAuthenticationResponseDto>`,
  `myPermissions(): Observable<UserPermissionsResponseDto>`.

- [ ] **Step 1: Write the failing test**

`.../services/authentication.service.spec.ts`:
```typescript
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AuthenticationService } from './authentication.service';
import { API_BASE_URL } from '../core';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let httpMock: HttpTestingController;
  const BASE = 'http://localhost:3000';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: BASE },
        AuthenticationService,
      ],
    });
    service = TestBed.inject(AuthenticationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('POSTs login to the gateway user-management path and unwraps data', () => {
    let result: unknown;
    service.login({ identifier: 'a@b.com', password: 'secret123' }).subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${BASE}/user-management-service/authentications/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ identifier: 'a@b.com', password: 'secret123' });
    req.flush({ statusCode: 200, success: true, message: 'ok', data: { _id: 'x', user: { _id: 'u1' } } });

    expect((result as { _id: string })._id).toBe('x');
  });

  it('surfaces backend message on error', () => {
    let err: unknown;
    service.login({ identifier: 'a', password: 'b' }).subscribe({ error: (e) => (err = e) });
    const req = httpMock.expectOne(`${BASE}/user-management-service/authentications/login`);
    req.flush({ statusCode: 401, success: false, message: 'Invalid credentials', data: null },
      { status: 401, statusText: 'Unauthorized' });
    expect((err as { statusCode: number; message: string })).toEqual({ statusCode: 401, message: 'Invalid credentials' });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm exec nx test data-access-user-management -- authentication.service`
Expected: FAIL (`AuthenticationService` not defined / file missing).

- [ ] **Step 3: Write the implementation**

`.../services/authentication.service.ts`:
```typescript
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  LoginDto,
  LogoutRequestDto,
  ServiceResponse,
  UserPermissionsResponseDto,
  WebAuthenticationResponseDto,
} from '@mushaviri/api-contracts';
import { API_BASE_URL, buildUrl, mapHttpError, USER_MANAGEMENT_PATH } from '../core';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = inject(API_BASE_URL);

  public login(dto: LoginDto): Observable<WebAuthenticationResponseDto> {
    return this.http
      .post<ServiceResponse<WebAuthenticationResponseDto>>(this.url('authentications', 'login'), dto)
      .pipe(map((r: ServiceResponse<WebAuthenticationResponseDto>): WebAuthenticationResponseDto => r.data), catchError(mapHttpError));
  }

  public logout(dto: LogoutRequestDto): Observable<void> {
    return this.http
      .post<ServiceResponse<void>>(this.url('authentications', 'logout'), dto)
      .pipe(map((): void => undefined), catchError(mapHttpError));
  }

  public refreshToken(): Observable<WebAuthenticationResponseDto> {
    return this.http
      .post<ServiceResponse<WebAuthenticationResponseDto>>(this.url('authentications', 'refresh-token'), {})
      .pipe(map((r: ServiceResponse<WebAuthenticationResponseDto>): WebAuthenticationResponseDto => r.data), catchError(mapHttpError));
  }

  public myPermissions(): Observable<UserPermissionsResponseDto> {
    return this.http
      .get<ServiceResponse<UserPermissionsResponseDto>>(this.url('authentications', 'my-permissions'))
      .pipe(map((r: ServiceResponse<UserPermissionsResponseDto>): UserPermissionsResponseDto => r.data), catchError(mapHttpError));
  }

  private url(...segments: string[]): string {
    return buildUrl(this.baseUrl, USER_MANAGEMENT_PATH, ...segments);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm exec nx test data-access-user-management -- authentication.service`
Expected: PASS (both cases).

- [ ] **Step 5: Export + commit**

Add to `libs/data-access-user-management/src/index.ts`:
```typescript
export * from './lib/services/authentication.service';
```
Run: `npm exec nx lint data-access-user-management`
```bash
git add libs/data-access-user-management
git commit -m "feat(data-access-user-management): AuthenticationService (login/logout/refresh/permissions)"
```

---

## Task 5: Resource services (users, roles, permissions, etc.)

Implement one service per remaining controller, following the exact pattern of Task 4 (inject `HttpClient` + `API_BASE_URL`, `buildUrl(this.baseUrl, USER_MANAGEMENT_PATH, ...)`, `map(r => r.data)`, `catchError(mapHttpError)`). Each is its own commit and its own `HttpTestingController` spec asserting URL + method + body/query + unwrap.

**Files (create + matching `.spec.ts` each):** `users.service.ts`, `system-users.service.ts`, `roles.service.ts`, `permissions.service.ts`, `role-permissions.service.ts`, `verifications.service.ts`, `devices.service.ts`, `countries.service.ts`, `audit-trail.service.ts`, `authentication-settings.service.ts`. Modify `src/index.ts` to export each.

**Interfaces (method signatures to produce):**
- `UsersService`: `create(dto: CreateUserDto): Observable<UserResponseDto>` → `POST users`; `update(userId: string, dto: UpdateUserDto): Observable<UserResponseDto>` → `PATCH users/:userId`; `changeContact(userId: string, dto: ChangeContactDto): Observable<UserResponseDto>` → `PATCH users/:userId/contact`; `list(query: GetUsersQueryDto): Observable<PaginateResult<UserResponseDto>>` → `GET users` (serialize defined query fields via `HttpParams`).
- `SystemUsersService`: `create(dto: CreateSystemUserDto): Observable<SystemUserResponseDto>` → `POST system-users`; `update(systemUserId, dto): Observable<SystemUserResponseDto>` → `PATCH system-users/:systemUserId`; `list(query?): Observable<PaginateResult<SystemUserResponseDto>>` → `GET system-users`.
- `RolesService`: `create(dto: CreateRoleDto): Observable<RoleResponseDto>` → `POST roles`; `update(id, dto: UpdateRoleDto): Observable<RoleResponseDto>` → `PATCH roles/:id`; `list(): Observable<PaginateResult<RoleResponseDto>>` → `GET roles`.
- `PermissionsService`: mirror RolesService with permission DTOs → `permissions` base.
- `RolePermissionsService`: `create(dto: CreateRolePermissionDto): Observable<RolePermissionResponseDto>` → `POST role-permissions`; `update(id, dto): Observable<RolePermissionResponseDto>` → `PATCH role-permissions/:id`; `list(): Observable<PaginateResult<RolePermissionResponseDto>>` → `GET role-permissions`.
- `VerificationsService`: `verify(dto: VerifyCodeDto): Observable<VerificationResponseDto>` → `PATCH verifications/verify`; `resend(dto: ResendCodeDto): Observable<void>` → `POST verifications/resend`.
- `DevicesService`: `list(): Observable<PaginateResult<DeviceResponseDto>>` → `GET devices`; `update(deviceId: string, body: Partial<DeviceResponseDto>): Observable<DeviceResponseDto>` → `PATCH devices/:deviceId`.
- `CountriesService`: `list(): Observable<CountryResponseDto[]>` → `GET countries` (data is a plain array, not paginated — no `.docs`).
- `AuditTrailService`: `me(): Observable<PaginateResult<AuditTrailResponseDto>>` → `GET audit-trail/me`; `list(): Observable<PaginateResult<AuditTrailResponseDto>>` → `GET audit-trail`.
- `AuthenticationSettingsService`: `get(): Observable<AuthenticationSettingsResponseDto>` → `GET authentication-settings`; `update(id: string, body: Partial<AuthenticationSettingsResponseDto>): Observable<AuthenticationSettingsResponseDto>` → `PATCH authentication-settings/:id`.

For each service repeat this cycle:

- [ ] **Step A: Write the failing spec** (copy Task 4's spec shape; assert URL `${BASE}/user-management-service/<base>[/<id>...]`, method, body/params, and that `r.data` is returned — for list endpoints flush `{ ...envelope, data: { docs: [...], totalDocs, limit, totalPages, hasNextPage, hasPrevPage, pagingCounter } }` and assert `.docs`).

Worked example — `UsersService.list` query serialization test (`users.service.spec.ts`):
```typescript
it('GETs users with only defined query params', () => {
  service.list({ status: UserStatus.ACTIVE, name: 'joe' }).subscribe();
  const req = httpMock.expectOne(
    (r) => r.url === `${BASE}/user-management-service/users`
  );
  expect(req.request.method).toBe('GET');
  expect(req.request.params.get('status')).toBe('ACTIVE');
  expect(req.request.params.get('name')).toBe('joe');
  expect(req.request.params.has('phoneNumber')).toBe(false);
  req.flush({ statusCode: 200, success: true, message: 'ok',
    data: { docs: [], totalDocs: 0, limit: 20, totalPages: 0, hasNextPage: false, hasPrevPage: false, pagingCounter: 0 } });
});
```

- [ ] **Step B: Run the spec, verify it FAILS** — `npm exec nx test data-access-user-management -- <name>.service`.

- [ ] **Step C: Implement the service.**

Worked example — `users.service.ts` (query serialization is the only non-obvious part; build `HttpParams` from defined fields only):
```typescript
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  ChangeContactDto, CreateUserDto, GetUsersQueryDto, PaginateResult,
  ServiceResponse, UpdateUserDto, UserResponseDto,
} from '@mushaviri/api-contracts';
import { API_BASE_URL, buildUrl, mapHttpError, USER_MANAGEMENT_PATH } from '../core';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = inject(API_BASE_URL);

  public create(dto: CreateUserDto): Observable<UserResponseDto> {
    return this.http.post<ServiceResponse<UserResponseDto>>(this.url(), dto)
      .pipe(map((r): UserResponseDto => r.data), catchError(mapHttpError));
  }

  public update(userId: string, dto: UpdateUserDto): Observable<UserResponseDto> {
    return this.http.patch<ServiceResponse<UserResponseDto>>(this.url(userId), dto)
      .pipe(map((r): UserResponseDto => r.data), catchError(mapHttpError));
  }

  public changeContact(userId: string, dto: ChangeContactDto): Observable<UserResponseDto> {
    return this.http.patch<ServiceResponse<UserResponseDto>>(this.url(userId, 'contact'), dto)
      .pipe(map((r): UserResponseDto => r.data), catchError(mapHttpError));
  }

  public list(query: GetUsersQueryDto = {}): Observable<PaginateResult<UserResponseDto>> {
    let params: HttpParams = new HttpParams();
    (Object.entries(query) as [string, unknown][]).forEach(([key, value]: [string, unknown]): void => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return this.http.get<ServiceResponse<PaginateResult<UserResponseDto>>>(this.url(), { params })
      .pipe(map((r): PaginateResult<UserResponseDto> => r.data), catchError(mapHttpError));
  }

  private url(...segments: string[]): string {
    return buildUrl(this.baseUrl, USER_MANAGEMENT_PATH, 'users', ...segments);
  }
}
```
The other services are structurally identical with their own base segment and DTOs — no query serialization except where a `list(query)` accepts filters (reuse the `HttpParams` loop above).

- [ ] **Step D: Run the spec, verify it PASSES.**

- [ ] **Step E: Export in `src/index.ts` + commit** — `git commit -m "feat(data-access-user-management): <Name>Service"`.

After all services: run `npm exec nx test data-access-user-management && npm exec nx lint data-access-user-management` (all green) and one final commit if any barrel edits remain.

---

## Task 6: Cookie-aware `apiInterceptor` in `data-access-auth`

**Files:**
- Create: `libs/data-access-auth/src/lib/interceptors/api.interceptor.ts`
- Modify: `libs/data-access-auth/src/index.ts`
- Test: `libs/data-access-auth/src/lib/interceptors/api.interceptor.spec.ts`

**Interfaces:**
- Produces (registered by Task 8 app configs): `apiInterceptor: HttpInterceptorFn` — for requests whose URL starts with the injected `API_BASE_URL`, clones the request with `withCredentials: true` and header `X-Client-Type: web`. Leaves non-API requests (e.g. `remoteEntry.json`) untouched.
- Consumes: `API_BASE_URL` from `@mushaviri/data-access-user-management`. (Boundary check: `data-access-auth` and `data-access-user-management` are both `type:data-access`; a `type:data-access → type:data-access` import is NOT allowed. Therefore DEFINE the token where the interceptor can legally reach it: re-declare `API_BASE_URL` in a `type:util` lib and import from there, OR keep the interceptor's base-URL check off a separate `type:util` token. **Chosen approach:** move `API_BASE_URL` into `@mushaviri/api-contracts` (`type:util`) so BOTH data-access libs import it legally. Update Task 3's `api-config.ts` to re-export it from api-contracts, and update Task 4/5 imports accordingly. If Task 3 already shipped, do this migration as the first step here.)

- [ ] **Step 1: Move `API_BASE_URL` to `api-contracts`**

Create `libs/api-contracts/src/lib/common/api-base-url.ts`:
```typescript
import { InjectionToken } from '@angular/core';
export const API_BASE_URL: InjectionToken<string> = new InjectionToken<string>('API_BASE_URL');
```
Add `export * from './api-base-url';` to `libs/api-contracts/src/lib/common/index.ts`.
In `libs/data-access-user-management/src/lib/core/api-config.ts`, replace the local token with `export { API_BASE_URL } from '@mushaviri/api-contracts';` (keep `USER_MANAGEMENT_PATH` local). Run `npm exec nx test data-access-user-management` to confirm nothing broke.

> Note: `api-contracts` importing `@angular/core` for an `InjectionToken` is fine — Angular is a peer dep and the lib stays `type:util`.

- [ ] **Step 2: Write the failing interceptor test**

`.../interceptors/api.interceptor.spec.ts`:
```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { API_BASE_URL } from '@mushaviri/api-contracts';
import { apiInterceptor } from './api.interceptor';

describe('apiInterceptor', () => {
  let http: HttpClient;
  let mock: HttpTestingController;
  const BASE = 'http://localhost:3000';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiInterceptor])),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: BASE },
      ],
    });
    http = TestBed.inject(HttpClient);
    mock = TestBed.inject(HttpTestingController);
  });
  afterEach(() => mock.verify());

  it('adds X-Client-Type and withCredentials for API requests', () => {
    http.get(`${BASE}/user-management-service/countries`).subscribe();
    const req = mock.expectOne(`${BASE}/user-management-service/countries`);
    expect(req.request.headers.get('X-Client-Type')).toBe('web');
    expect(req.request.withCredentials).toBe(true);
    req.flush({});
  });

  it('leaves non-API requests untouched', () => {
    http.get('http://localhost:4203/remoteEntry.json').subscribe();
    const req = mock.expectOne('http://localhost:4203/remoteEntry.json');
    expect(req.request.headers.has('X-Client-Type')).toBe(false);
    expect(req.request.withCredentials).toBe(false);
    req.flush({});
  });
});
```

- [ ] **Step 3: Run it, verify FAIL** — `npm exec nx test data-access-auth -- api.interceptor`.

- [ ] **Step 4: Implement the interceptor**

`.../interceptors/api.interceptor.ts`:
```typescript
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { API_BASE_URL } from '@mushaviri/api-contracts';

/**
 * For requests to the API gateway, flow the httpOnly auth cookie (withCredentials)
 * and tag the client type. Never adds an Authorization header — the JWT lives in a cookie.
 */
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const baseUrl: string = inject(API_BASE_URL);
  if (!baseUrl || !req.url.startsWith(baseUrl)) {
    return next(req);
  }
  return next(
    req.clone({
      withCredentials: true,
      setHeaders: { 'X-Client-Type': 'web' },
    }),
  );
};
```

- [ ] **Step 5: Run it, verify PASS.**

- [ ] **Step 6: Export + commit**

Add to `libs/data-access-auth/src/index.ts` (under `// Interceptors`): `export * from './lib/interceptors/api.interceptor';`
Run `npm exec nx lint data-access-auth`.
```bash
git add libs/api-contracts libs/data-access-user-management libs/data-access-auth
git commit -m "feat(data-access-auth): cookie-aware apiInterceptor; move API_BASE_URL to api-contracts"
```

---

## Task 7: Rewrite `AuthService` (mock → real, cookie-based)

**Files:**
- Modify: `libs/data-access-auth/src/lib/services/auth.service.ts`
- Test: `libs/data-access-auth/src/lib/services/auth.service.spec.ts` (create if absent)

**Interfaces:**
- Consumes: `AuthenticationService` (Task 4), `WebAuthenticationResponseDto`, `LogoutScope` (`@mushaviri/api-contracts`).
- Produces (used by shell login components — signatures preserved from the mock so callers don't change): `login(credentials: { email: string; password: string }): Observable<User>`, `logout(): Observable<void>`, `refreshToken(): Observable<void>`, `checkAuth(): Observable<boolean>`, signals `currentUser`, `isAuthenticated`, methods `getCurrentUser()`, `isAuthenticatedValue()`.

- [ ] **Step 1: Write the failing test**

`.../services/auth.service.spec.ts`:
```typescript
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { AuthenticationService } from '@mushaviri/data-access-user-management';

describe('AuthService (real)', () => {
  let authApi: { login: ReturnType<typeof vi.fn>; logout: ReturnType<typeof vi.fn>;
    refreshToken: ReturnType<typeof vi.fn>; myPermissions: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authApi = { login: vi.fn(), logout: vi.fn(), refreshToken: vi.fn(), myPermissions: vi.fn() };
    TestBed.configureTestingModule({
      providers: [AuthService, { provide: AuthenticationService, useValue: authApi }],
    });
  });

  it('maps email->identifier, populates currentUser from response', () => {
    authApi.login.mockReturnValue(of({ _id: 'a', user: { _id: 'u1', name: 'Joe', emailAddress: 'joe@x.com' } }));
    const service = TestBed.inject(AuthService);
    let emitted: unknown;
    service.login({ email: 'joe@x.com', password: 'secret123' }).subscribe((u) => (emitted = u));
    expect(authApi.login).toHaveBeenCalledWith({ identifier: 'joe@x.com', password: 'secret123' });
    expect(service.isAuthenticatedValue()).toBe(true);
    expect((emitted as { email: string }).email).toBe('joe@x.com');
  });

  it('checkAuth returns false and clears user on 401', () => {
    authApi.myPermissions.mockReturnValue(throwError(() => ({ statusCode: 401, message: 'no' })));
    const service = TestBed.inject(AuthService);
    let ok: boolean | undefined;
    service.checkAuth().subscribe((v) => (ok = v));
    expect(ok).toBe(false);
    expect(service.isAuthenticatedValue()).toBe(false);
  });
});
```

- [ ] **Step 2: Run it, verify FAIL** — `npm exec nx test data-access-auth -- auth.service`.

- [ ] **Step 3: Rewrite the service**

Replace the mock body of `libs/data-access-auth/src/lib/services/auth.service.ts` with real calls. Keep the `User` model + signal API identical so `LoginComponent` needs no change:
```typescript
import { computed, inject, Injectable, signal, Signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthenticationService } from '@mushaviri/data-access-user-management';
import { LogoutScope, WebAuthenticationResponseDto } from '@mushaviri/api-contracts';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authApi: AuthenticationService = inject(AuthenticationService);
  private readonly currentUserSignal: ReturnType<typeof signal<User | null>> = signal<User | null>(null);
  public readonly currentUser: Signal<User | null> = this.currentUserSignal.asReadonly();
  public readonly isAuthenticated: Signal<boolean> = computed((): boolean => !!this.currentUserSignal());

  public login(credentials: { email: string; password: string }): Observable<User> {
    return this.authApi
      .login({ identifier: credentials.email, password: credentials.password })
      .pipe(
        tap((res: WebAuthenticationResponseDto): void => this.setUserFromResponse(res)),
        map((res: WebAuthenticationResponseDto): User => this.toUser(res)),
      );
  }

  public logout(): Observable<void> {
    return this.authApi.logout({ scope: LogoutScope.CURRENT }).pipe(
      tap((): void => this.currentUserSignal.set(null)),
      catchError((): Observable<void> => {
        this.currentUserSignal.set(null);
        return of(void 0);
      }),
    );
  }

  public refreshToken(): Observable<void> {
    return this.authApi.refreshToken().pipe(
      tap((res: WebAuthenticationResponseDto): void => this.setUserFromResponse(res)),
      map((): void => undefined),
    );
  }

  public checkAuth(): Observable<boolean> {
    return this.authApi.myPermissions().pipe(
      map((): boolean => {
        // Session cookie is valid; keep any user already loaded.
        return true;
      }),
      catchError((): Observable<boolean> => {
        this.currentUserSignal.set(null);
        return of(false);
      }),
    );
  }

  public getCurrentUser(): User | null {
    return this.currentUserSignal();
  }

  public isAuthenticatedValue(): boolean {
    return !!this.currentUserSignal();
  }

  private setUserFromResponse(res: WebAuthenticationResponseDto): void {
    this.currentUserSignal.set(this.toUser(res));
  }

  private toUser(res: WebAuthenticationResponseDto): User {
    return {
      id: res.user?._id ?? res._id,
      email: res.user?.emailAddress ?? '',
      name: res.user?.name ?? '',
    };
  }
}
```
> If the `User` model lacks a field used above, keep it minimal (`id`, `email`, `name` already exist per `user.model.ts`). Do NOT store tokens (cookie-based).

- [ ] **Step 4: Run it, verify PASS.**

- [ ] **Step 5: Lint + commit**

Run `npm exec nx lint data-access-auth`.
```bash
git add libs/data-access-auth
git commit -m "feat(data-access-auth): real cookie-based AuthService backed by AuthenticationService"
```

---

## Task 8: Wire `apiBaseUrl` into shell environments + app configs

**Files:**
- Modify: `apps/shell/{admin,web,client}/src/environments/environment.ts` and `environment.prod.ts` (and the other env variants for that app — `.web.ts`, `.client.ts`, `.umdzidzisi.ts`, `.umtengesi.ts` — add the field so each stays assignable to the extended interface)
- Modify: `apps/shell/{admin,web,client}/src/app/app.config.ts`

**Interfaces:**
- Consumes: `API_BASE_URL` (`@mushaviri/api-contracts`), `apiInterceptor` (`@mushaviri/data-access-auth`).
- Produces: each shell provides `API_BASE_URL` = `environment.apiBaseUrl` and registers `apiInterceptor`.

- [ ] **Step 1: Extend the Environment interface + values (admin shown; repeat for web + client)**

In `apps/shell/admin/src/environments/environment.ts`, add to the `Environment` interface and object:
```typescript
interface Environment {
  production: boolean;
  defaultTheme: 'default' | 'admin' | 'umdzidzisi' | 'umtengesi';
  landingApp?: string;
  apiBaseUrl: string; // NEW
  remotes: Record<string, RemoteConfig>;
}

export const environment: Environment = {
  production: false,
  defaultTheme: 'admin',
  apiBaseUrl: 'http://localhost:3000', // NEW — gateway origin (dev)
  remotes: { /* unchanged */ },
};
```
In `environment.prod.ts` set `apiBaseUrl: 'https://api.mushaviri.com:8443'`. In each remaining variant (`.web.ts`, `.client.ts`, `.umdzidzisi.ts`, `.umtengesi.ts`) add `apiBaseUrl` (dev origin for non-prod variants) so they satisfy the interface. Repeat the whole step for `shell/web` and `shell/client`.

- [ ] **Step 2: Register the token + interceptor in each shell `app.config.ts`**

In `apps/shell/admin/src/app/app.config.ts`:
```typescript
import { API_BASE_URL } from '@mushaviri/api-contracts';
import { authInterceptor, apiInterceptor, AuthService } from '@mushaviri/data-access-auth';
// ...
providers: [
  provideBrowserGlobalErrorListeners(),
  provideRouter(appRoutes),
  provideHttpClient(withInterceptors([apiInterceptor, authInterceptor])),
  { provide: ENVIRONMENT, useValue: environment },
  { provide: API_BASE_URL, useValue: environment.apiBaseUrl },
  { provide: APP_INITIALIZER, useFactory: initializeAuth, deps: [AuthService], multi: true },
],
```
Repeat for `web` and `client`. (`authInterceptor` is kept but now a no-op for API calls since it only adds Bearer when a localStorage token exists, which we no longer set; it may be removed in a later cleanup.)

- [ ] **Step 3: Typecheck the shells**

Run: `npm exec nx run-many -t build --projects=shell-admin,shell-web,shell-client`
Expected: builds succeed (env objects satisfy the extended interface, imports resolve).

- [ ] **Step 4: Commit**

```bash
git add apps/shell
git commit -m "feat(shell): wire apiBaseUrl + apiInterceptor into admin/web/client app configs"
```

---

## Task 9: End-to-end login verification

**Files:** none (verification only). Document results in the commit or PR.

- [ ] **Step 1: Start the backend gateway + user-management-service**

In `backend-services`: start the API gateway (port 3000) and `user-management-service` (and their Mongo/Redis deps) per that repo's dev instructions. Confirm reachable:
```bash
curl -i http://localhost:3000/user-management-service/health
```
Expected: `200`.

- [ ] **Step 2: Sanity-check login via curl (cookie set)**

```bash
curl -i -X POST http://localhost:3000/user-management-service/authentications/login \
  -H 'Content-Type: application/json' -H 'X-Client-Type: web' \
  -d '{"identifier":"<known-user-email-or-phone>","password":"<password>"}'
```
Expected: `200`, a `ServiceResponse` JSON body WITHOUT `accessToken`/`refreshToken`, and `Set-Cookie` headers for the tokens. If it fails, stop and report (bad creds vs. CSRF vs. CORS) before touching frontend.

- [ ] **Step 3: Drive the real login in the shell (browser)**

Serve the admin shell: `npm exec nx serve shell-admin`. Use the claude-in-chrome tools (or manual browser) to load the login page, submit valid credentials, and in DevTools → Network confirm: request to `/user-management-service/authentications/login` carries `X-Client-Type: web` and `withCredentials`; response sets the auth cookie; the app navigates past login and `AuthService.currentUser` is populated (no console errors).

- [ ] **Step 4: Record the outcome**

Note in the PR description: endpoints verified, cookie confirmed, and whether a CSRF token header was required (if so, it was added to `apiInterceptor` — capture the header name). If CSRF blocks cookie POSTs, add the token handling to `apiInterceptor` and re-verify before closing the task.

---

## Self-Review Notes (already reconciled)

- **Spec coverage:** api-contracts (T1–T2), data-access-user-management scaffold+core (T3), AuthenticationService (T4), all resource services (T5), apiInterceptor (T6), real AuthService (T7), env/app-config wiring (T8), e2e verification (T9). Replication guide for the other 6 services is documentation in the spec — intentionally not a task this pass.
- **Boundary correctness:** `API_BASE_URL` is defined in `api-contracts` (`type:util`) so both `data-access-*` libs import it legally (T6, applied retroactively to T3–T5 imports). No `type:data-access → type:data-access` import exists.
- **Type consistency:** `WebAuthenticationResponseDto` (T2) is the return type of `AuthenticationService.login/refreshToken` (T4) and consumed by `AuthService` (T7). `buildUrl`/`mapHttpError`/`API_BASE_URL`/`USER_MANAGEMENT_PATH` names are identical across T3–T6. `ServiceResponse<T>`/`PaginateResult<T>` used uniformly.
- **Envelope choice:** uses backend `ServiceResponse`/`PaginateResult`, NOT the stale `ApiResponse`/`PaginatedResponse` in `libs/models`.
