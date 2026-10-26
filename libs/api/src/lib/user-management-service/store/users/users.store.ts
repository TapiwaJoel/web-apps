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
  ActivateSystemUserDto,
  CreateSystemUserDto,
  GetSystemUsersQueryDto,
  SystemUserResponseDto,
  UpdateSystemUserDto,
} from '../../dtos';
import { SystemUsersService } from '../../services';
import { PaginateResult } from '../../../common';
import { UsersState } from './users.state.type';

const initialState: UsersState = {
  users: [],
  usersLoaded: false,
  usersLoading: false,
  usersError: null,
  usersScope: null,
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
 * Shared system-users state for the product admin apps.
 *
 * Loaded once and kept in this root singleton so navigating away from and
 * back to the Users page reads already-fetched state instead of refetching.
 * The cached list is scoped to the `serviceName` it was loaded for, so a
 * different product's admin asking for its own users triggers a refetch.
 */
export const UsersStore: Type<
  {
    users: Signal<SystemUserResponseDto[]>;
    usersLoaded: Signal<boolean>;
    usersLoading: Signal<boolean>;
    usersError: Signal<string | null>;
    loadUsers: (query?: GetSystemUsersQueryDto) => void;
    createUser: (
      dto: CreateSystemUserDto,
      callbacks: { next: () => void; error: (message: string) => void },
    ) => void;
    updateUser: (
      id: string,
      dto: UpdateSystemUserDto,
      callbacks: { next: () => void; error: (message: string) => void },
    ) => void;
    activateUser: (
      dto: ActivateSystemUserDto,
      callbacks: { next: () => void; error: (message: string) => void },
    ) => void;
  } & StateSource<UsersState>
> = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (
      store: StateSignals<UsersState> & WritableStateSource<UsersState>,
      systemUsersService: SystemUsersService = inject(SystemUsersService),
    ): {
      loadUsers: (query?: GetSystemUsersQueryDto) => void;
      createUser: (
        dto: CreateSystemUserDto,
        callbacks: { next: () => void; error: (message: string) => void },
      ) => void;
      updateUser: (
        id: string,
        dto: UpdateSystemUserDto,
        callbacks: { next: () => void; error: (message: string) => void },
      ) => void;
      activateUser: (
        dto: ActivateSystemUserDto,
        callbacks: { next: () => void; error: (message: string) => void },
      ) => void;
    } => ({
      /**
       * A query with no criteria other than `serviceName` loads the full
       * user list for that service and is cached; any other criteria always
       * hit the network and merge into the existing list.
       */
      loadUsers(query?: GetSystemUsersQueryDto): void {
        const isLoadAll: boolean = Object.keys(query ?? {}).every(
          (key: string) => key === 'serviceName',
        );
        const scope: string | null = query?.serviceName ?? null;

        if (isLoadAll) {
          if (
            store.usersScope() === scope &&
            (store.usersLoaded() || store.usersLoading())
          ) {
            return;
          }
          patchState(store, {
            usersScope: scope,
            usersLoaded: false,
            usersLoading: true,
            usersError: null,
          });
        }

        systemUsersService.list(query ?? {}).subscribe({
          next: (result: PaginateResult<SystemUserResponseDto>): void => {
            if (isLoadAll) {
              if (store.usersScope() !== scope) {
                return;
              }
              patchState(store, {
                users: result.docs,
                usersLoaded: true,
                usersLoading: false,
              });
              return;
            }
            const existingIds: Set<string> = new Set(
              store.users().map((user: SystemUserResponseDto) => user._id),
            );
            const newUsers: SystemUserResponseDto[] = result.docs.filter(
              (user: SystemUserResponseDto) => !existingIds.has(user._id),
            );
            patchState(store, { users: [...store.users(), ...newUsers] });
          },
          error: (error: unknown): void => {
            if (isLoadAll && store.usersScope() === scope) {
              patchState(store, {
                usersLoading: false,
                usersError: toErrorMessage(error),
              });
            }
          },
        });
      },

      createUser(
        dto: CreateSystemUserDto,
        callbacks: { next: () => void; error: (message: string) => void },
      ): void {
        systemUsersService.create(dto).subscribe({
          next: (created: SystemUserResponseDto): void => {
            patchState(store, { users: [...store.users(), created] });
            callbacks.next();
          },
          error: (error: unknown): void => {
            callbacks.error(toErrorMessage(error));
          },
        });
      },

      updateUser(
        id: string,
        dto: UpdateSystemUserDto,
        callbacks: { next: () => void; error: (message: string) => void },
      ): void {
        systemUsersService.update(id, dto).subscribe({
          next: (updated: SystemUserResponseDto): void => {
            patchState(store, {
              users: store
                .users()
                .map((user: SystemUserResponseDto) =>
                  user._id === id ? updated : user,
                ),
            });
            callbacks.next();
          },
          error: (error: unknown): void => {
            callbacks.error(toErrorMessage(error));
          },
        });
      },

      activateUser(
        dto: ActivateSystemUserDto,
        callbacks: { next: () => void; error: (message: string) => void },
      ): void {
        systemUsersService.activate(dto).subscribe({
          next: (activated: SystemUserResponseDto): void => {
            const existingIds: Set<string> = new Set(
              store.users().map((user: SystemUserResponseDto) => user._id),
            );
            patchState(store, {
              users: existingIds.has(activated._id)
                ? store
                    .users()
                    .map((user: SystemUserResponseDto) =>
                      user._id === activated._id ? activated : user,
                    )
                : [...store.users(), activated],
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
