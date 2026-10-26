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
  CreatePolicyPeriodDto,
  GetPolicyPeriodsQueryDto,
  PolicyPeriodResponseDto,
  UpdatePolicyPeriodDto,
} from '../../dtos';
import { PolicyPeriodsService } from '../../services';
import { HeaderPaginationParams, PaginateResult } from '../../../common';
import { PolicyPeriodsState } from './policy-periods.state.type';

const initialState: PolicyPeriodsState = {
  policyPeriods: [],
  policyPeriodsLoaded: false,
  policyPeriodsLoading: false,
  policyPeriodsError: null,
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
 * Shared policy-periods state for insurance-admin.
 *
 * Loaded once and kept in this root singleton so navigating away from and
 * back to the Policy Periods page reads already-fetched state instead of
 * refetching.
 */
export const PolicyPeriodsStore: Type<
  {
    policyPeriods: Signal<PolicyPeriodResponseDto[]>;
    policyPeriodsLoaded: Signal<boolean>;
    policyPeriodsLoading: Signal<boolean>;
    policyPeriodsError: Signal<string | null>;
    loadPolicyPeriods: (
      query?: GetPolicyPeriodsQueryDto,
      page?: HeaderPaginationParams,
    ) => void;
    createPolicyPeriod: (
      dto: CreatePolicyPeriodDto,
      callbacks: {
        next: (policyPeriod: PolicyPeriodResponseDto) => void;
        error: (message: string) => void;
      },
    ) => void;
    updatePolicyPeriod: (
      id: string,
      dto: UpdatePolicyPeriodDto,
      callbacks: {
        next: (policyPeriod: PolicyPeriodResponseDto) => void;
        error: (message: string) => void;
      },
    ) => void;
  } & StateSource<PolicyPeriodsState>
> = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (
      store: StateSignals<PolicyPeriodsState> &
        WritableStateSource<PolicyPeriodsState>,
      policyPeriodsService: PolicyPeriodsService = inject(PolicyPeriodsService),
    ): {
      loadPolicyPeriods: (
        query?: GetPolicyPeriodsQueryDto,
        page?: HeaderPaginationParams,
      ) => void;
      createPolicyPeriod: (
        dto: CreatePolicyPeriodDto,
        callbacks: {
          next: (policyPeriod: PolicyPeriodResponseDto) => void;
          error: (message: string) => void;
        },
      ) => void;
      updatePolicyPeriod: (
        id: string,
        dto: UpdatePolicyPeriodDto,
        callbacks: {
          next: (policyPeriod: PolicyPeriodResponseDto) => void;
          error: (message: string) => void;
        },
      ) => void;
    } => ({
      loadPolicyPeriods(
        query?: GetPolicyPeriodsQueryDto,
        page?: HeaderPaginationParams,
      ): void {
        const isLoadAll: boolean =
          (!query || Object.keys(query).length === 0) &&
          (!page || Object.keys(page).length === 0);

        if (isLoadAll) {
          if (store.policyPeriodsLoaded() || store.policyPeriodsLoading()) {
            return;
          }
          patchState(store, {
            policyPeriodsLoading: true,
            policyPeriodsError: null,
          });
        }

        policyPeriodsService.list(query ?? {}, page ?? {}).subscribe({
          next: (result: PaginateResult<PolicyPeriodResponseDto>): void => {
            if (isLoadAll) {
              patchState(store, {
                policyPeriods: result.docs,
                policyPeriodsLoaded: true,
                policyPeriodsLoading: false,
              });
            } else {
              const existingIds: Set<string> = new Set(
                store
                  .policyPeriods()
                  .map((item: PolicyPeriodResponseDto) => item._id),
              );
              const newItems: PolicyPeriodResponseDto[] = result.docs.filter(
                (item: PolicyPeriodResponseDto) => !existingIds.has(item._id),
              );
              patchState(store, {
                policyPeriods: [...store.policyPeriods(), ...newItems],
              });
            }
          },
          error: (error: unknown): void => {
            if (isLoadAll) {
              patchState(store, {
                policyPeriodsLoading: false,
                policyPeriodsError: toErrorMessage(error),
              });
            }
          },
        });
      },

      createPolicyPeriod(
        dto: CreatePolicyPeriodDto,
        callbacks: {
          next: (policyPeriod: PolicyPeriodResponseDto) => void;
          error: (message: string) => void;
        },
      ): void {
        policyPeriodsService.create(dto).subscribe({
          next: (created: PolicyPeriodResponseDto): void => {
            patchState(store, {
              policyPeriods: [...store.policyPeriods(), created],
            });
            callbacks.next(created);
          },
          error: (error: unknown): void => {
            callbacks.error(toErrorMessage(error));
          },
        });
      },

      updatePolicyPeriod(
        id: string,
        dto: UpdatePolicyPeriodDto,
        callbacks: {
          next: (policyPeriod: PolicyPeriodResponseDto) => void;
          error: (message: string) => void;
        },
      ): void {
        policyPeriodsService.update(id, dto).subscribe({
          next: (updated: PolicyPeriodResponseDto): void => {
            patchState(store, {
              policyPeriods: store
                .policyPeriods()
                .map((policyPeriod: PolicyPeriodResponseDto) =>
                  policyPeriod._id === id ? updated : policyPeriod,
                ),
            });
            callbacks.next(updated);
          },
          error: (error: unknown): void => {
            callbacks.error(toErrorMessage(error));
          },
        });
      },
    }),
  ),
);
