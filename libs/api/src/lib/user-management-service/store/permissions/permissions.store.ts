import { inject, Signal, Type } from '@angular/core';
import {
  patchState,
  signalStore,
  StateSignals,
  StateSource,
  withMethods,
  withState,
  WritableStateSource,
} from '@ngrx/signals';
import { EMPTY, expand, reduce } from 'rxjs';
import { PermissionResponseDto } from '../../dtos';
import { PermissionsService } from '../../services';
import { PaginateResult } from '../../../common';
import { PermissionsState } from './permissions.state.type';

const initialState: PermissionsState = {
  permissions: [],
  permissionsLoaded: false,
  permissionsLoading: false,
  permissionsError: null,
};

/** `mapHttpError` surfaces the backend's ServiceResponse.message as `ApiError`. */
function toErrorMessage(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message;
  }
  return 'Something went wrong. Please try again.';
}

/**
 * Shared, read-only permissions catalog for insurance-admin, spanning every
 * service (insurance, user-management, payment-gateway, messaging, etc.) —
 * the Roles detail drawer renders one unified grid across all of them, and
 * role-creation auto-assignment reads from this same catalog.
 *
 * The permission catalog is created/seeded server-side per service, so this
 * store only lists permissions for assignment — it has no create/update
 * methods.
 */
export const PermissionsStore: Type<
  {
    permissions: Signal<PermissionResponseDto[]>;
    permissionsLoaded: Signal<boolean>;
    permissionsLoading: Signal<boolean>;
    permissionsError: Signal<string | null>;
    loadPermissions: () => void;
  } & StateSource<PermissionsState>
> = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (
      store: StateSignals<PermissionsState> &
        WritableStateSource<PermissionsState>,
      permissionsService: PermissionsService = inject(PermissionsService),
    ): {
      loadPermissions: () => void;
    } => ({
      loadPermissions(): void {
        if (store.permissionsLoaded() || store.permissionsLoading()) {
          return;
        }
        patchState(store, { permissionsLoading: true, permissionsError: null });
        // The backend caps a single request's page size at 100, and the
        // full cross-service catalog exceeds that — page through every
        // result via `expand` until `hasNextPage` is false, then flatten.
        // `MAX_PAGES` is a defensive ceiling (100 * 100 = 10k rows) so a
        // backend/caching bug that keeps reporting `hasNextPage: true`
        // can't loop forever.
        const MAX_PAGES: number = 100;
        permissionsService
          .list()
          .pipe(
            expand(
              (
                result: PaginateResult<PermissionResponseDto>,
                pageIndex: number,
              ) =>
                result.hasNextPage &&
                result.nextPage &&
                pageIndex + 1 < MAX_PAGES
                  ? permissionsService.list({ page: result.nextPage })
                  : EMPTY,
            ),
            reduce(
              (
                all: PermissionResponseDto[],
                result: PaginateResult<PermissionResponseDto>,
              ) => [...all, ...result.docs],
              [] as PermissionResponseDto[],
            ),
          )
          .subscribe({
            next: (permissions: PermissionResponseDto[]): void => {
              patchState(store, {
                permissions,
                permissionsLoaded: true,
                permissionsLoading: false,
              });
            },
            error: (error: unknown): void => {
              patchState(store, {
                permissionsLoading: false,
                permissionsError: toErrorMessage(error),
              });
            },
          });
      },
    }),
  ),
);
