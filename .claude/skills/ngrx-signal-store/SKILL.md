---
name: ngrx-signal-store
description: Use when creating, reviewing, or refactoring an @ngrx/signals signalStore in this workspace — covers where the store file belongs (libs/api vs libs/util) and how to type it so @typescript-eslint/typedef passes without erasing type safety.
---

# NgRx SignalStore Conventions

This skill documents how `@ngrx/signals` `signalStore`s are structured and typed in this
workspace. It exists because the "obvious" ways to satisfy this repo's strict
`@typescript-eslint/typedef` rule on a `signalStore` either erase all type safety or
silently break `signalStore`'s own generic inference — both look fine until you try to
use the store from a component.

## When to Use This Skill

Use this skill when:

- Creating a new `signalStore` for any resource
- Reviewing or refactoring an existing `signalStore`
- Deciding whether new store state belongs in `libs/api` or `libs/util`
- Hitting a `@typescript-eslint/typedef` error on a `signalStore` export

---

## 1. Where the Store File Lives

**Rule:** a store that wraps one specific `@mushaviri/api` backend-service's HTTP
service(s) lives **inside `libs/api`**, under that backend service's own folder, in a
sibling `store/` directory next to `dtos/`, `services/`, and `enums/` — grouped by
**backend service**, never by product/app.

```
libs/api/src/lib/user-management-service/
  dtos/
  enums/
  services/
    system-users.service.ts
    roles.service.ts
    devices.service.ts
  store/                          <- new
    users.store.ts                 wraps SystemUsersService
    roles.store.ts                 wraps RolesService
    devices.store.ts               wraps DevicesService
  index.ts                        <- re-export store/ alongside dtos/services/enums
```

Do **not** group stores by product (`store/insurance/`, `store/umdzidzisi/`, ...) — the
services they wrap aren't product-specific, and grouping by product mislabels a store
that's actually reusable by any product's admin app.

Cross-cutting state that isn't tied to one backend-service resource (e.g. `SessionStore`
for the authenticated session) stays in `libs/util`, not `libs/api` — see
`libs/util/src/lib/auth/session.store.ts` for that pattern instead.

**Accepted tradeoff:** `libs/api` is normally treated as a regenerable folder (rebuilt
from backend stubs). This workspace made a deliberate exception to put service-scoped
stores there anyway, grouped with the service they belong to. If a service folder is
ever regenerated wholesale, its `store/` subfolder must be preserved manually — it will
not survive an automated regen.

Import stores from `@mushaviri/api`, same as any other export from that service's folder
— not from `@mushaviri/util`.

---

## 2. Typing the Store Export

**Problem:** `signalStore(...)`'s return type is a deeply generic `Type<...>` that
`@typescript-eslint/typedef`'s `variableDeclaration: true` demands be spelled out
explicitly — but there's no short name for it.

**❌ Wrong — erases all usability:**

```typescript
export const DevicesStore: Type<object> = signalStore(...);
// Compiles, satisfies eslint, but inject(DevicesStore).devices() no longer typechecks —
// every member is erased.
```

**❌ Wrong — hides the problem instead of solving it:**

```typescript
// eslint-disable-next-line @typescript-eslint/typedef
export const DevicesStore = signalStore(...);
```

**✅ Correct — spell out the real type:** list every state field as `Signal<T>` and every
method with its exact signature, intersected with `StateSource<XState>`:

```typescript
export const DevicesStore: Type<
  {
    devices: Signal<Partial<DeviceResponseDto>[]>;
    devicesLoaded: Signal<boolean>;
    devicesLoading: Signal<boolean>;
    devicesError: Signal<string | null>;
    loadDevices: () => void;
    deactivateDevice: (
      deviceId: string,
      callbacks: { next: () => void; error: (message: string) => void },
    ) => void;
  } & StateSource<DevicesState>
> = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(...),
);
```

`Type` and `Signal` come from `@angular/core`; `StateSource` comes from `@ngrx/signals`.
This is fully type-safe: `inject(DevicesStore).devices()`, `.loadDevices()`, etc. all
keep their real signatures.

---

## 3. Typing the `withMethods` Callback

**The `store`/`service` parameters** get explicit types — `store` is
`StateSignals<XState> & WritableStateSource<XState>` (both from `@ngrx/signals`), the
service param is its own concrete service type:

```typescript
withMethods(
  (
    store: StateSignals<DevicesState> & WritableStateSource<DevicesState>,
    devicesService: DevicesService = inject(DevicesService),
  ) => ({ ... }),
),
```

**The callback's return type** (the methods object) needs an **inline object type
literal** — not a named `interface`:

**❌ Wrong — breaks `signalStore`'s generic inference:**

```typescript
interface DevicesStoreMethods {
  loadDevices: () => void;
  deactivateDevice: (deviceId: string, callbacks: {...}) => void;
}

withMethods(
  (store, devicesService): DevicesStoreMethods => ({ ... }),  // ❌
),
```

A named interface has no index signature, which fails `withMethods`'s
`Methods extends MethodsDictionary` constraint. This doesn't error at the `withMethods`
call — instead it silently collapses the _entire_ `signalStore(...)` chain's inferred
type down to `{ [x: string]: Function }`, which then fails to satisfy the outer
`Type<...>` annotation from section 2 with a confusing structural-mismatch error.

**✅ Correct — inline object type literal:**

```typescript
withMethods(
  (
    store: StateSignals<DevicesState> & WritableStateSource<DevicesState>,
    devicesService: DevicesService = inject(DevicesService),
  ): {
    loadDevices: () => void;
    deactivateDevice: (
      deviceId: string,
      callbacks: { next: () => void; error: (message: string) => void },
    ) => void;
  } => ({
    loadDevices(): void { ... },
    deactivateDevice(deviceId, callbacks): void { ... },
  }),
),
```

An inline literal satisfies `MethodsDictionary` structurally and preserves full type
safety — same member list as the outer `Type<...>` annotation in section 2, just without
`Signal<...>` wrapping (these are methods, not state).

---

## 4. Typing `.subscribe()` Callbacks

Give every `next` callback its real Observable payload type instead of leaving it
inferred — typically `PaginateResult<T>` from `@mushaviri/api`'s common types for list
endpoints, or the resource DTO itself for single-item responses:

```typescript
devicesService.list().subscribe({
  next: (result: PaginateResult<DeviceResponseDto>): void => {
    patchState(store, { devices: result.docs, ... });
  },
  error: (error: unknown): void => { ... },
});
```

---

## 5. Complete Worked Example

`libs/api/src/lib/user-management-service/store/devices.store.ts` is the canonical
example — read it directly for a full store applying every pattern above:

```typescript
import { inject, Signal, Type } from '@angular/core';
import { patchState, signalStore, StateSignals, StateSource, withMethods, withState, WritableStateSource } from '@ngrx/signals';
import { DeviceResponseDto } from '../dtos';
import { DevicesService } from '../services';
import { PaginateResult } from '../../common';

export interface DevicesState {
  devices: Partial<DeviceResponseDto>[];
  devicesLoaded: boolean;
  devicesLoading: boolean;
  devicesError: string | null;
}

const initialState: DevicesState = {
  devices: [],
  devicesLoaded: false,
  devicesLoading: false,
  devicesError: null,
};

function toErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'message' in error && typeof (error as { message: unknown }).message === 'string') {
    return (error as { message: string }).message;
  }
  return 'Something went wrong. Please try again.';
}

export const DevicesStore: Type<
  {
    devices: Signal<Partial<DeviceResponseDto>[]>;
    devicesLoaded: Signal<boolean>;
    devicesLoading: Signal<boolean>;
    devicesError: Signal<string | null>;
    loadDevices: () => void;
    deactivateDevice: (deviceId: string, callbacks: { next: () => void; error: (message: string) => void }) => void;
  } & StateSource<DevicesState>
> = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (
      store: StateSignals<DevicesState> & WritableStateSource<DevicesState>,
      devicesService: DevicesService = inject(DevicesService),
    ): {
      loadDevices: () => void;
      deactivateDevice: (deviceId: string, callbacks: { next: () => void; error: (message: string) => void }) => void;
    } => ({
      loadDevices(): void {
        if (store.devicesLoaded() || store.devicesLoading()) {
          return;
        }
        patchState(store, { devicesLoading: true, devicesError: null });
        devicesService.list().subscribe({
          next: (result: PaginateResult<DeviceResponseDto>): void => {
            patchState(store, {
              devices: result.docs,
              devicesLoaded: true,
              devicesLoading: false,
            });
          },
          error: (error: unknown): void => {
            patchState(store, {
              devicesLoading: false,
              devicesError: toErrorMessage(error),
            });
          },
        });
      },

      deactivateDevice(deviceId: string, callbacks: { next: () => void; error: (message: string) => void }): void {
        devicesService.update(deviceId, { isActive: false }).subscribe({
          next: (updated: DeviceResponseDto): void => {
            patchState(store, {
              devices: store.devices().map((device: Partial<DeviceResponseDto>) => (device.deviceId === deviceId ? updated : device)),
            });
            callbacks.next();
          },
          error: (error: unknown): void => {
            callbacks.error(toErrorMessage(error));
          },
        });
      },
    }),
  ),
);
```

Note the `loadX()` guard pattern (`if (store.xLoaded() || store.xLoading()) return;`) —
this is what makes the store worth having: state loads once and survives component
remounts, instead of every page visit re-fetching from the network.

---

## Quick Reference

| What                         | Do                                                                          | Don't                                |
| ---------------------------- | --------------------------------------------------------------------------- | ------------------------------------ |
| Store location               | `libs/api/<service>/store/`                                                 | `libs/util/store/<product>/`         |
| Store export type            | Full `Type<{...} & StateSource<XState>>`                                    | `Type<object>`, `eslint-disable`     |
| `withMethods` params         | Explicit `StateSignals<X> & WritableStateSource<X>` + concrete service type | Leave untyped/inferred               |
| `withMethods` return type    | Inline object type literal                                                  | Named `interface` (breaks inference) |
| `.subscribe({ next })` param | Explicit `PaginateResult<T>` / DTO type                                     | Leave untyped/inferred               |

## Common Mistakes

- **Named interface for the methods return type** → collapses the whole store's inferred
  type to `{ [x: string]: Function }`, surfaces as a confusing mismatch against the outer
  `Type<...>` annotation, not as an error on the `withMethods` line itself.
- **`Type<object>` or `Type<unknown>` on the store export** → compiles and satisfies
  lint, but silently erases every state signal and method from the injected instance's
  type. Always spell out the real member list instead.
- **Grouping new stores by product folder** → services aren't product-specific; group by
  the backend service the store's methods actually call.
