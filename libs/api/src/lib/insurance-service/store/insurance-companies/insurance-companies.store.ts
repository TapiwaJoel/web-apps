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
  CreateInsuranceCompanyDto,
  GetInsuranceCompaniesQueryDto,
  InsuranceCompanyResponseDto,
  UpdateInsuranceCompanyDto,
} from '../../dtos';
import { InsuranceCompaniesService } from '../../services';
import { HeaderPaginationParams, PaginateResult } from '../../../common';
import { InsuranceCompaniesState } from './insurance-companies.state.type';

const initialState: InsuranceCompaniesState = {
  insuranceCompanies: [],
  insuranceCompaniesLoaded: false,
  insuranceCompaniesLoading: false,
  insuranceCompaniesError: null,
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
 * Shared insurance-companies state for insurance-admin.
 *
 * Loaded once and kept in this root singleton so navigating away from and
 * back to the Insurance Companies page reads already-fetched state instead
 * of refetching.
 */
export const InsuranceCompaniesStore: Type<
  {
    insuranceCompanies: Signal<InsuranceCompanyResponseDto[]>;
    insuranceCompaniesLoaded: Signal<boolean>;
    insuranceCompaniesLoading: Signal<boolean>;
    insuranceCompaniesError: Signal<string | null>;
    loadInsuranceCompanies: (
      query?: GetInsuranceCompaniesQueryDto,
      page?: HeaderPaginationParams,
    ) => void;
    createInsuranceCompany: (
      dto: CreateInsuranceCompanyDto,
      callbacks: {
        next: (insuranceCompany: InsuranceCompanyResponseDto) => void;
        error: (message: string) => void;
      },
    ) => void;
    updateInsuranceCompany: (
      id: string,
      dto: UpdateInsuranceCompanyDto,
      callbacks: {
        next: (insuranceCompany: InsuranceCompanyResponseDto) => void;
        error: (message: string) => void;
      },
    ) => void;
  } & StateSource<InsuranceCompaniesState>
> = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (
      store: StateSignals<InsuranceCompaniesState> &
        WritableStateSource<InsuranceCompaniesState>,
      insuranceCompaniesService: InsuranceCompaniesService = inject(
        InsuranceCompaniesService,
      ),
    ): {
      loadInsuranceCompanies: (
        query?: GetInsuranceCompaniesQueryDto,
        page?: HeaderPaginationParams,
      ) => void;
      createInsuranceCompany: (
        dto: CreateInsuranceCompanyDto,
        callbacks: {
          next: (insuranceCompany: InsuranceCompanyResponseDto) => void;
          error: (message: string) => void;
        },
      ) => void;
      updateInsuranceCompany: (
        id: string,
        dto: UpdateInsuranceCompanyDto,
        callbacks: {
          next: (insuranceCompany: InsuranceCompanyResponseDto) => void;
          error: (message: string) => void;
        },
      ) => void;
    } => ({
      loadInsuranceCompanies(
        query?: GetInsuranceCompaniesQueryDto,
        page?: HeaderPaginationParams,
      ): void {
        const isLoadAll: boolean =
          (!query || Object.keys(query).length === 0) &&
          (!page || Object.keys(page).length === 0);

        if (isLoadAll) {
          if (
            store.insuranceCompaniesLoaded() ||
            store.insuranceCompaniesLoading()
          ) {
            return;
          }
          patchState(store, {
            insuranceCompaniesLoading: true,
            insuranceCompaniesError: null,
          });
        }

        insuranceCompaniesService.list(query ?? {}, page ?? {}).subscribe({
          next: (result: PaginateResult<InsuranceCompanyResponseDto>): void => {
            if (isLoadAll) {
              patchState(store, {
                insuranceCompanies: result.docs,
                insuranceCompaniesLoaded: true,
                insuranceCompaniesLoading: false,
              });
            } else {
              const existingIds: Set<string> = new Set(
                store
                  .insuranceCompanies()
                  .map((item: InsuranceCompanyResponseDto) => item._id),
              );
              const newItems: InsuranceCompanyResponseDto[] =
                result.docs.filter(
                  (item: InsuranceCompanyResponseDto) =>
                    !existingIds.has(item._id),
                );
              patchState(store, {
                insuranceCompanies: [
                  ...store.insuranceCompanies(),
                  ...newItems,
                ],
              });
            }
          },
          error: (error: unknown): void => {
            if (isLoadAll) {
              patchState(store, {
                insuranceCompaniesLoading: false,
                insuranceCompaniesError: toErrorMessage(error),
              });
            }
          },
        });
      },

      createInsuranceCompany(
        dto: CreateInsuranceCompanyDto,
        callbacks: {
          next: (insuranceCompany: InsuranceCompanyResponseDto) => void;
          error: (message: string) => void;
        },
      ): void {
        insuranceCompaniesService.create(dto).subscribe({
          next: (created: InsuranceCompanyResponseDto): void => {
            patchState(store, {
              insuranceCompanies: [...store.insuranceCompanies(), created],
            });
            callbacks.next(created);
          },
          error: (error: unknown): void => {
            callbacks.error(toErrorMessage(error));
          },
        });
      },

      updateInsuranceCompany(
        id: string,
        dto: UpdateInsuranceCompanyDto,
        callbacks: {
          next: (insuranceCompany: InsuranceCompanyResponseDto) => void;
          error: (message: string) => void;
        },
      ): void {
        insuranceCompaniesService.update(id, dto).subscribe({
          next: (updated: InsuranceCompanyResponseDto): void => {
            patchState(store, {
              insuranceCompanies: store
                .insuranceCompanies()
                .map((insuranceCompany: InsuranceCompanyResponseDto) =>
                  insuranceCompany._id === id ? updated : insuranceCompany,
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
