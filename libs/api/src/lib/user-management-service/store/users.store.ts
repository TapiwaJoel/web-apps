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
import { CreateSystemUserDto, SystemUserResponseDto } from '../dtos';
import { SystemUsersService } from '../services';
import { INSURANCE_PATH, PaginateResult } from '../../common';

export interface UsersState {
  users: SystemUserResponseDto[];
  usersLoaded: boolean;
  usersLoading: boolean;
  usersError: string | null;
}

const initialState: UsersState = {
  users: [],
  usersLoaded: false,
  usersLoading: false,
  usersError: null,
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
 * Shared system-users state for insurance-admin.
 *
 * Loaded once and kept in this root singleton so navigating away from and
 * back to the Users page reads already-fetched state instead of refetching.
 */
export const UsersStore: Type<
  {
    users: Signal<SystemUserResponseDto[]>;
    usersLoaded: Signal<boolean>;
    usersLoading: Signal<boolean>;
    usersError: Signal<string | null>;
    loadUsers: () => void;
    createUser: (
      dto: CreateSystemUserDto,
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
      loadUsers: () => void;
      createUser: (
        dto: CreateSystemUserDto,
        callbacks: { next: () => void; error: (message: string) => void },
      ) => void;
    } => ({
      loadUsers(): void {
        if (store.usersLoaded() || store.usersLoading()) {
          return;
        }
        patchState(store, { usersLoading: true, usersError: null });
        systemUsersService.list({ serviceName: INSURANCE_PATH }).subscribe({
          next: (result: PaginateResult<SystemUserResponseDto>): void => {
            patchState(store, {
              users: result.docs,
              usersLoaded: true,
              usersLoading: false,
            });
          },
          error: (error: unknown): void => {
            patchState(store, {
              usersLoading: false,
              usersError: toErrorMessage(error),
            });
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
    }),
  ),
);
