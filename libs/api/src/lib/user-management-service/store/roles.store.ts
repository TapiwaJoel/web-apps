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
import { RoleResponseDto } from '../dtos';
import { RolesService } from '../services';
import { INSURANCE_PATH, PaginateResult } from '../../common';

export interface RolesState {
  roles: RoleResponseDto[];
  rolesLoaded: boolean;
}

const initialState: RolesState = {
  roles: [],
  rolesLoaded: false,
};

/**
 * Shared roles state for insurance-admin.
 *
 * Loaded once and kept in this root singleton so any page needing roles
 * (e.g. Users, a future role-management page) reads already-fetched state
 * instead of refetching.
 */
export const RolesStore: Type<
  {
    roles: Signal<RoleResponseDto[]>;
    rolesLoaded: Signal<boolean>;
    loadRoles: () => void;
  } & StateSource<RolesState>
> = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (
      store: StateSignals<RolesState> & WritableStateSource<RolesState>,
      rolesService: RolesService = inject(RolesService),
    ): {
      loadRoles: () => void;
    } => ({
      loadRoles(): void {
        if (store.rolesLoaded()) {
          return;
        }
        rolesService.list({ serviceName: INSURANCE_PATH }).subscribe({
          next: (result: PaginateResult<RoleResponseDto>): void => {
            patchState(store, { roles: result.docs, rolesLoaded: true });
          },
          error: (): void => {
            patchState(store, { roles: [], rolesLoaded: true });
          },
        });
      },
    }),
  ),
);
