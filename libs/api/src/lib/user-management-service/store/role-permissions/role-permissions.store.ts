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
import { CreateRolePermissionDto, RolePermissionResponseDto } from '../../dtos';
import { RolePermissionsService } from '../../services';
import { PaginateResult } from '../../../common';
import { RolePermissionsState } from './role-permissions.state.type';

const initialState: RolePermissionsState = {
  rolePermissions: [],
  rolePermissionsLoaded: false,
  rolePermissionsLoading: false,
  rolePermissionsError: null,
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
 * Shared role↔permission assignment state for insurance-admin.
 *
 * The backend has no server-side filter by role, so this loads the full
 * join table once; consumers (the Roles detail page) filter client-side by
 * `roleId`.
 */
export const RolePermissionsStore: Type<
  {
    rolePermissions: Signal<RolePermissionResponseDto[]>;
    rolePermissionsLoaded: Signal<boolean>;
    rolePermissionsLoading: Signal<boolean>;
    rolePermissionsError: Signal<string | null>;
    loadRolePermissions: () => void;
    createRolePermission: (
      dto: CreateRolePermissionDto,
      callbacks: { next: () => void; error: (message: string) => void },
    ) => void;
    updateRolePermission: (
      id: string,
      dto: Partial<CreateRolePermissionDto>,
      callbacks: { next: () => void; error: (message: string) => void },
    ) => void;
  } & StateSource<RolePermissionsState>
> = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (
      store: StateSignals<RolePermissionsState> &
        WritableStateSource<RolePermissionsState>,
      rolePermissionsService: RolePermissionsService = inject(
        RolePermissionsService,
      ),
    ): {
      loadRolePermissions: () => void;
      createRolePermission: (
        dto: CreateRolePermissionDto,
        callbacks: { next: () => void; error: (message: string) => void },
      ) => void;
      updateRolePermission: (
        id: string,
        dto: Partial<CreateRolePermissionDto>,
        callbacks: { next: () => void; error: (message: string) => void },
      ) => void;
    } => ({
      loadRolePermissions(): void {
        if (store.rolePermissionsLoaded() || store.rolePermissionsLoading()) {
          return;
        }
        patchState(store, {
          rolePermissionsLoading: true,
          rolePermissionsError: null,
        });
        // The backend caps a single request's page size at 100, and the
        // join table can exceed that — page through every result via
        // `expand` until `hasNextPage` is false, then flatten. `MAX_PAGES`
        // is a defensive ceiling (100 * 100 = 10k rows) so a backend/caching
        // bug that keeps reporting `hasNextPage: true` can't loop forever.
        const MAX_PAGES: number = 100;
        rolePermissionsService
          .list()
          .pipe(
            expand(
              (
                result: PaginateResult<RolePermissionResponseDto>,
                pageIndex: number,
              ) =>
                result.hasNextPage &&
                result.nextPage &&
                pageIndex + 1 < MAX_PAGES
                  ? rolePermissionsService.list({ page: result.nextPage })
                  : EMPTY,
            ),
            reduce(
              (
                all: RolePermissionResponseDto[],
                result: PaginateResult<RolePermissionResponseDto>,
              ) => [...all, ...result.docs],
              [] as RolePermissionResponseDto[],
            ),
          )
          .subscribe({
            next: (rolePermissions: RolePermissionResponseDto[]): void => {
              patchState(store, {
                rolePermissions,
                rolePermissionsLoaded: true,
                rolePermissionsLoading: false,
              });
            },
            error: (error: unknown): void => {
              patchState(store, {
                rolePermissionsLoading: false,
                rolePermissionsError: toErrorMessage(error),
              });
            },
          });
      },

      createRolePermission(
        dto: CreateRolePermissionDto,
        callbacks: { next: () => void; error: (message: string) => void },
      ): void {
        rolePermissionsService.create(dto).subscribe({
          next: (created: RolePermissionResponseDto): void => {
            patchState(store, {
              rolePermissions: [...store.rolePermissions(), created],
            });
            callbacks.next();
          },
          error: (error: unknown): void => {
            callbacks.error(toErrorMessage(error));
          },
        });
      },

      updateRolePermission(
        id: string,
        dto: Partial<CreateRolePermissionDto>,
        callbacks: { next: () => void; error: (message: string) => void },
      ): void {
        rolePermissionsService.update(id, dto).subscribe({
          next: (updated: RolePermissionResponseDto): void => {
            patchState(store, {
              rolePermissions: store
                .rolePermissions()
                .map((rolePermission: RolePermissionResponseDto) =>
                  rolePermission._id === id ? updated : rolePermission,
                ),
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
