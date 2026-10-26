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
  CreateSubscriptionDto,
  GetSubscriptionsQueryDto,
  SubscriptionResponseDto,
  SubscriptionsListResponseDto,
} from '../../dtos';
import { SubscriptionsService } from '../../services';
import { Observable, map } from 'rxjs';
import { fetchAllPagesBy, HeaderPaginationParams } from '../../../common';
import { SubscriptionsState } from './subscriptions.state.type';

const initialState: SubscriptionsState = {
  subscriptions: [],
  subscriptionsLoaded: false,
  subscriptionsLoading: false,
  subscriptionsError: null,
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
 * Shared subscriptions state for the learning-management admin.
 *
 * Loaded once and kept in this root singleton so navigating away from and
 * back to the Subscriptions page reads already-fetched state instead of
 * refetching.
 */
export const SubscriptionsStore: Type<
  {
    subscriptions: Signal<SubscriptionResponseDto[]>;
    subscriptionsLoaded: Signal<boolean>;
    subscriptionsLoading: Signal<boolean>;
    subscriptionsError: Signal<string | null>;
    loadSubscriptions: (
      query?: GetSubscriptionsQueryDto,
      page?: HeaderPaginationParams,
    ) => void;
    createSubscription: (
      dto: CreateSubscriptionDto,
      callbacks: {
        next: (subscription: SubscriptionResponseDto) => void;
        error: (message: string) => void;
      },
    ) => void;
  } & StateSource<SubscriptionsState>
> = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (
      store: StateSignals<SubscriptionsState> &
        WritableStateSource<SubscriptionsState>,
      subscriptionsService: SubscriptionsService = inject(SubscriptionsService),
    ): {
      loadSubscriptions: (
        query?: GetSubscriptionsQueryDto,
        page?: HeaderPaginationParams,
      ) => void;
      createSubscription: (
        dto: CreateSubscriptionDto,
        callbacks: {
          next: (subscription: SubscriptionResponseDto) => void;
          error: (message: string) => void;
        },
      ) => void;
    } => ({
      loadSubscriptions(
        query?: GetSubscriptionsQueryDto,
        page?: HeaderPaginationParams,
      ): void {
        const isLoadAll: boolean =
          (!query || Object.keys(query).length === 0) &&
          (!page || Object.keys(page).length === 0);

        if (isLoadAll) {
          if (store.subscriptionsLoaded() || store.subscriptionsLoading()) {
            return;
          }
          patchState(store, {
            subscriptionsLoading: true,
            subscriptionsError: null,
          });
        }

        const items$: Observable<SubscriptionResponseDto[]> = isLoadAll
          ? fetchAllPagesBy(
              (
                allPage: HeaderPaginationParams,
              ): Observable<SubscriptionsListResponseDto> =>
                subscriptionsService.list({}, allPage),
              (
                result: SubscriptionsListResponseDto,
              ): SubscriptionResponseDto[] => result.subscriptions,
            )
          : subscriptionsService
              .list(query ?? {}, page ?? {})
              .pipe(
                map(
                  (
                    result: SubscriptionsListResponseDto,
                  ): SubscriptionResponseDto[] => result.subscriptions,
                ),
              );

        items$.subscribe({
          next: (docs: SubscriptionResponseDto[]): void => {
            if (isLoadAll) {
              patchState(store, {
                subscriptions: docs,
                subscriptionsLoaded: true,
                subscriptionsLoading: false,
              });
            } else {
              const existingIds: Set<string> = new Set(
                store
                  .subscriptions()
                  .map((item: SubscriptionResponseDto) => item._id),
              );
              const newItems: SubscriptionResponseDto[] = docs.filter(
                (item: SubscriptionResponseDto) => !existingIds.has(item._id),
              );
              patchState(store, {
                subscriptions: [...store.subscriptions(), ...newItems],
              });
            }
          },
          error: (error: unknown): void => {
            if (isLoadAll) {
              patchState(store, {
                subscriptionsLoading: false,
                subscriptionsError: toErrorMessage(error),
              });
            }
          },
        });
      },

      createSubscription(
        dto: CreateSubscriptionDto,
        callbacks: {
          next: (subscription: SubscriptionResponseDto) => void;
          error: (message: string) => void;
        },
      ): void {
        subscriptionsService.create(dto).subscribe({
          next: (created: SubscriptionResponseDto): void => {
            patchState(store, {
              subscriptions: [...store.subscriptions(), created],
            });
            callbacks.next(created);
          },
          error: (error: unknown): void => {
            callbacks.error(toErrorMessage(error));
          },
        });
      },
    }),
  ),
);
