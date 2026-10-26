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
import {
  CreateRoleDto,
  GetRolesQueryDto,
  RoleResponseDto,
  UpdateRoleDto,
} from '../../dtos';
import { RolesService } from '../../services';
import { PaginateResult } from '../../../common';
import { RolesState } from './roles.state.type';

const initialState: RolesState = {
  roles: [],
  rolesLoaded: false,
  rolesLoading: false,
  rolesError: null,
  rolesScope: null,
  rolesQueriesFetching: [],
};

function queryKey(query: GetRolesQueryDto): string {
  return JSON.stringify(query);
}

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
 * Shared roles state for the product admin apps.
 *
 * Loaded once and kept in this root singleton so any page needing roles
 * (Users, the Roles management page) reads already-fetched state instead of
 * refetching. The cached list is scoped to the `serviceName` it was loaded
 * for, so a different product's admin asking for its own roles refetches.
 */
export const RolesStore: Type<
  {
    roles: Signal<RoleResponseDto[]>;
    rolesLoaded: Signal<boolean>;
    rolesLoading: Signal<boolean>;
    rolesError: Signal<string | null>;
    loadRoles: (
      query?: GetRolesQueryDto,
      callbacks?: {
        next?: (roles: RoleResponseDto[]) => void;
        error?: (message: string) => void;
      },
    ) => void;
    createRole: (
      dto: CreateRoleDto,
      callbacks: {
        next: (role: RoleResponseDto) => void;
        error: (message: string) => void;
      },
    ) => void;
    updateRole: (
      id: string,
      dto: UpdateRoleDto,
      callbacks: { next: () => void; error: (message: string) => void },
    ) => void;
  } & StateSource<RolesState>
> = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (
      store: StateSignals<RolesState> & WritableStateSource<RolesState>,
      rolesService: RolesService = inject(RolesService),
    ): {
      loadRoles: (
        query?: GetRolesQueryDto,
        callbacks?: {
          next?: (roles: RoleResponseDto[]) => void;
          error?: (message: string) => void;
        },
      ) => void;
      createRole: (
        dto: CreateRoleDto,
        callbacks: {
          next: (role: RoleResponseDto) => void;
          error: (message: string) => void;
        },
      ) => void;
      updateRole: (
        id: string,
        dto: UpdateRoleDto,
        callbacks: { next: () => void; error: (message: string) => void },
      ) => void;
    } => ({
      /**
       * Loads all roles (no criteria other than `serviceName`) or a filtered subset
       * matching arbitrary criteria (id, name, status, serviceName,
       * isSensitive - anything `RolesService.list` supports).
       *
       * The "load all" case reuses the already-loaded/loading cache guard
       * so repeat visits don't refetch; a filtered call always hits the
       * network. An exact `_id` lookup checks the already-loaded `roles`
       * cache first and resolves immediately on a hit. Either way, an
       * identical query already in flight is not requested twice, and a
       * filtered result is merged into the cache rather than replacing it.
       */
      loadRoles(
        query?: GetRolesQueryDto,
        callbacks?: {
          next?: (roles: RoleResponseDto[]) => void;
          error?: (message: string) => void;
        },
      ): void {
        const isLoadAll: boolean = Object.keys(query ?? {}).every(
          (key: string) => key === 'serviceName',
        );
        const scope: string | null = query?.serviceName ?? null;

        if (
          isLoadAll &&
          store.rolesScope() === scope &&
          (store.rolesLoaded() || store.rolesLoading())
        ) {
          callbacks?.next?.(store.roles());
          return;
        }

        const effectiveQuery: GetRolesQueryDto = query ?? {};

        if (effectiveQuery._id) {
          const cached: RoleResponseDto | undefined = store
            .roles()
            .find((role: RoleResponseDto) => role._id === effectiveQuery._id);
          if (cached) {
            callbacks?.next?.([cached]);
            return;
          }
        }

        const key: string = queryKey(effectiveQuery);
        if (store.rolesQueriesFetching().includes(key)) {
          return;
        }

        if (isLoadAll) {
          patchState(store, {
            rolesScope: scope,
            rolesLoaded: false,
            rolesLoading: true,
            rolesError: null,
          });
        }
        patchState(store, {
          rolesQueriesFetching: [...store.rolesQueriesFetching(), key],
        });

        rolesService.list(effectiveQuery).subscribe({
          next: (result: PaginateResult<RoleResponseDto>): void => {
            const fetching: string[] = store
              .rolesQueriesFetching()
              .filter((fetchingKey: string) => fetchingKey !== key);
            if (isLoadAll && store.rolesScope() !== scope) {
              patchState(store, { rolesQueriesFetching: fetching });
            } else if (isLoadAll) {
              patchState(store, {
                roles: result.docs,
                rolesLoaded: true,
                rolesLoading: false,
                rolesQueriesFetching: fetching,
              });
            } else {
              const existingIds: Set<string> = new Set(
                store.roles().map((role: RoleResponseDto) => role._id),
              );
              const newRoles: RoleResponseDto[] = result.docs.filter(
                (role: RoleResponseDto) => !existingIds.has(role._id),
              );
              patchState(store, {
                roles: [...store.roles(), ...newRoles],
                rolesQueriesFetching: fetching,
              });
            }
            callbacks?.next?.(result.docs);
          },
          error: (error: unknown): void => {
            const fetching: string[] = store
              .rolesQueriesFetching()
              .filter((fetchingKey: string) => fetchingKey !== key);
            if (isLoadAll && store.rolesScope() === scope) {
              patchState(store, {
                rolesLoading: false,
                rolesError: toErrorMessage(error),
                rolesQueriesFetching: fetching,
              });
            } else {
              patchState(store, { rolesQueriesFetching: fetching });
            }
            callbacks?.error?.(toErrorMessage(error));
          },
        });
      },

      createRole(
        dto: CreateRoleDto,
        callbacks: {
          next: (role: RoleResponseDto) => void;
          error: (message: string) => void;
        },
      ): void {
        rolesService.create(dto).subscribe({
          next: (created: RoleResponseDto): void => {
            patchState(store, { roles: [...store.roles(), created] });
            callbacks.next(created);
          },
          error: (error: unknown): void => {
            callbacks.error(toErrorMessage(error));
          },
        });
      },

      updateRole(
        id: string,
        dto: UpdateRoleDto,
        callbacks: { next: () => void; error: (message: string) => void },
      ): void {
        rolesService.update(id, dto).subscribe({
          next: (updated: RoleResponseDto): void => {
            patchState(store, {
              roles: store
                .roles()
                .map((role: RoleResponseDto) =>
                  role._id === id ? updated : role,
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
