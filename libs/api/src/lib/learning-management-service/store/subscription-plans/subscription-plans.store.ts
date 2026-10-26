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
  CreateSubscriptionPlanDto,
  GetSubscriptionPlansQueryDto,
  SubscriptionPlanResponseDto,
  UpdateSubscriptionPlanDto,
} from '../../dtos';
import { SubscriptionPlansService } from '../../services';
import { Observable, map } from 'rxjs';
import {
  fetchAllPages,
  HeaderPaginationParams,
  PaginateResult,
} from '../../../common';
import { SubscriptionPlansState } from './subscription-plans.state.type';

const initialState: SubscriptionPlansState = {
  subscriptionPlans: [],
  subscriptionPlansLoaded: false,
  subscriptionPlansLoading: false,
  subscriptionPlansError: null,
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
 * Shared subscription-plans state for the learning-management admin.
 *
 * Loaded once and kept in this root singleton so navigating away from and
 * back to the Subscription Plans page reads already-fetched state instead of
 * refetching.
 */
export const SubscriptionPlansStore: Type<
  {
    subscriptionPlans: Signal<SubscriptionPlanResponseDto[]>;
    subscriptionPlansLoaded: Signal<boolean>;
    subscriptionPlansLoading: Signal<boolean>;
    subscriptionPlansError: Signal<string | null>;
    loadSubscriptionPlans: (
      query?: GetSubscriptionPlansQueryDto,
      page?: HeaderPaginationParams,
    ) => void;
    createSubscriptionPlan: (
      dto: CreateSubscriptionPlanDto,
      callbacks: {
        next: (subscriptionPlan: SubscriptionPlanResponseDto) => void;
        error: (message: string) => void;
      },
    ) => void;
    updateSubscriptionPlan: (
      id: string,
      dto: UpdateSubscriptionPlanDto,
      callbacks: {
        next: (subscriptionPlan: SubscriptionPlanResponseDto) => void;
        error: (message: string) => void;
      },
    ) => void;
  } & StateSource<SubscriptionPlansState>
> = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (
      store: StateSignals<SubscriptionPlansState> &
        WritableStateSource<SubscriptionPlansState>,
      subscriptionPlansService: SubscriptionPlansService = inject(
        SubscriptionPlansService,
      ),
    ): {
      loadSubscriptionPlans: (
        query?: GetSubscriptionPlansQueryDto,
        page?: HeaderPaginationParams,
      ) => void;
      createSubscriptionPlan: (
        dto: CreateSubscriptionPlanDto,
        callbacks: {
          next: (subscriptionPlan: SubscriptionPlanResponseDto) => void;
          error: (message: string) => void;
        },
      ) => void;
      updateSubscriptionPlan: (
        id: string,
        dto: UpdateSubscriptionPlanDto,
        callbacks: {
          next: (subscriptionPlan: SubscriptionPlanResponseDto) => void;
          error: (message: string) => void;
        },
      ) => void;
    } => ({
      loadSubscriptionPlans(
        query?: GetSubscriptionPlansQueryDto,
        page?: HeaderPaginationParams,
      ): void {
        const isLoadAll: boolean =
          (!query || Object.keys(query).length === 0) &&
          (!page || Object.keys(page).length === 0);

        if (isLoadAll) {
          if (
            store.subscriptionPlansLoaded() ||
            store.subscriptionPlansLoading()
          ) {
            return;
          }
          patchState(store, {
            subscriptionPlansLoading: true,
            subscriptionPlansError: null,
          });
        }

        const items$: Observable<SubscriptionPlanResponseDto[]> = isLoadAll
          ? fetchAllPages(
              (
                allPage: HeaderPaginationParams,
              ): Observable<PaginateResult<SubscriptionPlanResponseDto>> =>
                subscriptionPlansService.list({}, allPage),
            )
          : subscriptionPlansService
              .list(query ?? {}, page ?? {})
              .pipe(
                map(
                  (
                    result: PaginateResult<SubscriptionPlanResponseDto>,
                  ): SubscriptionPlanResponseDto[] => result.docs,
                ),
              );

        items$.subscribe({
          next: (docs: SubscriptionPlanResponseDto[]): void => {
            if (isLoadAll) {
              patchState(store, {
                subscriptionPlans: docs,
                subscriptionPlansLoaded: true,
                subscriptionPlansLoading: false,
              });
            } else {
              const existingIds: Set<string> = new Set(
                store
                  .subscriptionPlans()
                  .map((item: SubscriptionPlanResponseDto) => item._id),
              );
              const newItems: SubscriptionPlanResponseDto[] = docs.filter(
                (item: SubscriptionPlanResponseDto) =>
                  !existingIds.has(item._id),
              );
              patchState(store, {
                subscriptionPlans: [...store.subscriptionPlans(), ...newItems],
              });
            }
          },
          error: (error: unknown): void => {
            if (isLoadAll) {
              patchState(store, {
                subscriptionPlansLoading: false,
                subscriptionPlansError: toErrorMessage(error),
              });
            }
          },
        });
      },

      createSubscriptionPlan(
        dto: CreateSubscriptionPlanDto,
        callbacks: {
          next: (subscriptionPlan: SubscriptionPlanResponseDto) => void;
          error: (message: string) => void;
        },
      ): void {
        subscriptionPlansService.create(dto).subscribe({
          next: (created: SubscriptionPlanResponseDto): void => {
            patchState(store, {
              subscriptionPlans: [...store.subscriptionPlans(), created],
            });
            callbacks.next(created);
          },
          error: (error: unknown): void => {
            callbacks.error(toErrorMessage(error));
          },
        });
      },

      updateSubscriptionPlan(
        id: string,
        dto: UpdateSubscriptionPlanDto,
        callbacks: {
          next: (subscriptionPlan: SubscriptionPlanResponseDto) => void;
          error: (message: string) => void;
        },
      ): void {
        subscriptionPlansService.update(id, dto).subscribe({
          next: (updated: SubscriptionPlanResponseDto): void => {
            patchState(store, {
              subscriptionPlans: store
                .subscriptionPlans()
                .map((subscriptionPlan: SubscriptionPlanResponseDto) =>
                  subscriptionPlan._id === id ? updated : subscriptionPlan,
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
