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
  CreateInsuranceCoverageTypeDto,
  GetInsuranceCoverageTypesQueryDto,
  InsuranceCoverageTypeResponseDto,
  UpdateInsuranceCoverageTypeDto,
} from '../../dtos';
import { InsuranceCoverageTypesService } from '../../services';
import { HeaderPaginationParams, PaginateResult } from '../../../common';
import { InsuranceCoverageTypesState } from './insurance-coverage-types.state.type';

const initialState: InsuranceCoverageTypesState = {
  insuranceCoverageTypes: [],
  insuranceCoverageTypesLoaded: false,
  insuranceCoverageTypesLoading: false,
  insuranceCoverageTypesError: null,
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
 * Shared insurance-coverage-types state for insurance-admin.
 *
 * Loaded once and kept in this root singleton so navigating away from and
 * back to the Insurance Coverage Types page reads already-fetched state
 * instead of refetching.
 */
export const InsuranceCoverageTypesStore: Type<
  {
    insuranceCoverageTypes: Signal<InsuranceCoverageTypeResponseDto[]>;
    insuranceCoverageTypesLoaded: Signal<boolean>;
    insuranceCoverageTypesLoading: Signal<boolean>;
    insuranceCoverageTypesError: Signal<string | null>;
    loadInsuranceCoverageTypes: (
      query?: GetInsuranceCoverageTypesQueryDto,
      page?: HeaderPaginationParams,
    ) => void;
    createInsuranceCoverageType: (
      dto: CreateInsuranceCoverageTypeDto,
      callbacks: {
        next: (insuranceCoverageType: InsuranceCoverageTypeResponseDto) => void;
        error: (message: string) => void;
      },
    ) => void;
    updateInsuranceCoverageType: (
      id: string,
      dto: UpdateInsuranceCoverageTypeDto,
      callbacks: {
        next: (insuranceCoverageType: InsuranceCoverageTypeResponseDto) => void;
        error: (message: string) => void;
      },
    ) => void;
  } & StateSource<InsuranceCoverageTypesState>
> = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (
      store: StateSignals<InsuranceCoverageTypesState> &
        WritableStateSource<InsuranceCoverageTypesState>,
      insuranceCoverageTypesService: InsuranceCoverageTypesService = inject(
        InsuranceCoverageTypesService,
      ),
    ): {
      loadInsuranceCoverageTypes: (
        query?: GetInsuranceCoverageTypesQueryDto,
        page?: HeaderPaginationParams,
      ) => void;
      createInsuranceCoverageType: (
        dto: CreateInsuranceCoverageTypeDto,
        callbacks: {
          next: (
            insuranceCoverageType: InsuranceCoverageTypeResponseDto,
          ) => void;
          error: (message: string) => void;
        },
      ) => void;
      updateInsuranceCoverageType: (
        id: string,
        dto: UpdateInsuranceCoverageTypeDto,
        callbacks: {
          next: (
            insuranceCoverageType: InsuranceCoverageTypeResponseDto,
          ) => void;
          error: (message: string) => void;
        },
      ) => void;
    } => ({
      loadInsuranceCoverageTypes(
        query?: GetInsuranceCoverageTypesQueryDto,
        page?: HeaderPaginationParams,
      ): void {
        const isLoadAll: boolean =
          (!query || Object.keys(query).length === 0) &&
          (!page || Object.keys(page).length === 0);

        if (isLoadAll) {
          if (
            store.insuranceCoverageTypesLoaded() ||
            store.insuranceCoverageTypesLoading()
          ) {
            return;
          }
          patchState(store, {
            insuranceCoverageTypesLoading: true,
            insuranceCoverageTypesError: null,
          });
        }

        insuranceCoverageTypesService.list(query ?? {}, page ?? {}).subscribe({
          next: (
            result: PaginateResult<InsuranceCoverageTypeResponseDto>,
          ): void => {
            if (isLoadAll) {
              patchState(store, {
                insuranceCoverageTypes: result.docs,
                insuranceCoverageTypesLoaded: true,
                insuranceCoverageTypesLoading: false,
              });
            } else {
              const existingIds: Set<string> = new Set(
                store
                  .insuranceCoverageTypes()
                  .map((item: InsuranceCoverageTypeResponseDto) => item._id),
              );
              const newItems: InsuranceCoverageTypeResponseDto[] =
                result.docs.filter(
                  (item: InsuranceCoverageTypeResponseDto) =>
                    !existingIds.has(item._id),
                );
              patchState(store, {
                insuranceCoverageTypes: [
                  ...store.insuranceCoverageTypes(),
                  ...newItems,
                ],
              });
            }
          },
          error: (error: unknown): void => {
            if (isLoadAll) {
              patchState(store, {
                insuranceCoverageTypesLoading: false,
                insuranceCoverageTypesError: toErrorMessage(error),
              });
            }
          },
        });
      },

      createInsuranceCoverageType(
        dto: CreateInsuranceCoverageTypeDto,
        callbacks: {
          next: (
            insuranceCoverageType: InsuranceCoverageTypeResponseDto,
          ) => void;
          error: (message: string) => void;
        },
      ): void {
        insuranceCoverageTypesService.create(dto).subscribe({
          next: (created: InsuranceCoverageTypeResponseDto): void => {
            patchState(store, {
              insuranceCoverageTypes: [
                ...store.insuranceCoverageTypes(),
                created,
              ],
            });
            callbacks.next(created);
          },
          error: (error: unknown): void => {
            callbacks.error(toErrorMessage(error));
          },
        });
      },

      updateInsuranceCoverageType(
        id: string,
        dto: UpdateInsuranceCoverageTypeDto,
        callbacks: {
          next: (
            insuranceCoverageType: InsuranceCoverageTypeResponseDto,
          ) => void;
          error: (message: string) => void;
        },
      ): void {
        insuranceCoverageTypesService.update(id, dto).subscribe({
          next: (updated: InsuranceCoverageTypeResponseDto): void => {
            patchState(store, {
              insuranceCoverageTypes: store
                .insuranceCoverageTypes()
                .map(
                  (insuranceCoverageType: InsuranceCoverageTypeResponseDto) =>
                    insuranceCoverageType._id === id
                      ? updated
                      : insuranceCoverageType,
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
