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
  ComprehensiveRateResponseDto,
  CreateComprehensiveRateDto,
  GetComprehensiveRatesQueryDto,
  UpdateComprehensiveRateDto,
} from '../../dtos';
import { ComprehensiveRatesService } from '../../services';
import { HeaderPaginationParams, PaginateResult } from '../../../common';
import { ComprehensiveRatesState } from './comprehensive-rates.state.type';

const initialState: ComprehensiveRatesState = {
  comprehensiveRates: [],
  comprehensiveRatesLoaded: false,
  comprehensiveRatesLoading: false,
  comprehensiveRatesError: null,
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
 * Shared comprehensive-rates state for insurance-admin.
 *
 * Loaded once and kept in this root singleton so navigating away from and
 * back to the Comprehensive Rates page reads already-fetched state instead
 * of refetching.
 */
export const ComprehensiveRatesStore: Type<
  {
    comprehensiveRates: Signal<ComprehensiveRateResponseDto[]>;
    comprehensiveRatesLoaded: Signal<boolean>;
    comprehensiveRatesLoading: Signal<boolean>;
    comprehensiveRatesError: Signal<string | null>;
    loadComprehensiveRates: (
      query?: GetComprehensiveRatesQueryDto,
      page?: HeaderPaginationParams,
    ) => void;
    createComprehensiveRate: (
      dto: CreateComprehensiveRateDto,
      callbacks: {
        next: (comprehensiveRate: ComprehensiveRateResponseDto) => void;
        error: (message: string) => void;
      },
    ) => void;
    updateComprehensiveRate: (
      id: string,
      dto: UpdateComprehensiveRateDto,
      callbacks: {
        next: (comprehensiveRate: ComprehensiveRateResponseDto) => void;
        error: (message: string) => void;
      },
    ) => void;
  } & StateSource<ComprehensiveRatesState>
> = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (
      store: StateSignals<ComprehensiveRatesState> &
        WritableStateSource<ComprehensiveRatesState>,
      comprehensiveRatesService: ComprehensiveRatesService = inject(
        ComprehensiveRatesService,
      ),
    ): {
      loadComprehensiveRates: (
        query?: GetComprehensiveRatesQueryDto,
        page?: HeaderPaginationParams,
      ) => void;
      createComprehensiveRate: (
        dto: CreateComprehensiveRateDto,
        callbacks: {
          next: (comprehensiveRate: ComprehensiveRateResponseDto) => void;
          error: (message: string) => void;
        },
      ) => void;
      updateComprehensiveRate: (
        id: string,
        dto: UpdateComprehensiveRateDto,
        callbacks: {
          next: (comprehensiveRate: ComprehensiveRateResponseDto) => void;
          error: (message: string) => void;
        },
      ) => void;
    } => ({
      loadComprehensiveRates(
        query?: GetComprehensiveRatesQueryDto,
        page?: HeaderPaginationParams,
      ): void {
        const isLoadAll: boolean =
          (!query || Object.keys(query).length === 0) &&
          (!page || Object.keys(page).length === 0);

        if (isLoadAll) {
          if (
            store.comprehensiveRatesLoaded() ||
            store.comprehensiveRatesLoading()
          ) {
            return;
          }
          patchState(store, {
            comprehensiveRatesLoading: true,
            comprehensiveRatesError: null,
          });
        }

        comprehensiveRatesService.list(query ?? {}, page ?? {}).subscribe({
          next: (
            result: PaginateResult<ComprehensiveRateResponseDto>,
          ): void => {
            if (isLoadAll) {
              patchState(store, {
                comprehensiveRates: result.docs,
                comprehensiveRatesLoaded: true,
                comprehensiveRatesLoading: false,
              });
            } else {
              const existingIds: Set<string> = new Set(
                store
                  .comprehensiveRates()
                  .map((item: ComprehensiveRateResponseDto) => item._id),
              );
              const newItems: ComprehensiveRateResponseDto[] =
                result.docs.filter(
                  (item: ComprehensiveRateResponseDto) =>
                    !existingIds.has(item._id),
                );
              patchState(store, {
                comprehensiveRates: [
                  ...store.comprehensiveRates(),
                  ...newItems,
                ],
              });
            }
          },
          error: (error: unknown): void => {
            if (isLoadAll) {
              patchState(store, {
                comprehensiveRatesLoading: false,
                comprehensiveRatesError: toErrorMessage(error),
              });
            }
          },
        });
      },

      createComprehensiveRate(
        dto: CreateComprehensiveRateDto,
        callbacks: {
          next: (comprehensiveRate: ComprehensiveRateResponseDto) => void;
          error: (message: string) => void;
        },
      ): void {
        comprehensiveRatesService.create(dto).subscribe({
          next: (created: ComprehensiveRateResponseDto): void => {
            patchState(store, {
              comprehensiveRates: [...store.comprehensiveRates(), created],
            });
            callbacks.next(created);
          },
          error: (error: unknown): void => {
            callbacks.error(toErrorMessage(error));
          },
        });
      },

      updateComprehensiveRate(
        id: string,
        dto: UpdateComprehensiveRateDto,
        callbacks: {
          next: (comprehensiveRate: ComprehensiveRateResponseDto) => void;
          error: (message: string) => void;
        },
      ): void {
        comprehensiveRatesService.update(id, dto).subscribe({
          next: (updated: ComprehensiveRateResponseDto): void => {
            patchState(store, {
              comprehensiveRates: store
                .comprehensiveRates()
                .map((comprehensiveRate: ComprehensiveRateResponseDto) =>
                  comprehensiveRate._id === id ? updated : comprehensiveRate,
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
