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
  CreateVehicleUsageDto,
  GetVehicleUsagesQueryDto,
  UpdateVehicleUsageDto,
  VehicleUsageResponseDto,
} from '../../dtos';
import { VehicleUsagesService } from '../../services';
import { HeaderPaginationParams, PaginateResult } from '../../../common';
import { VehicleUsagesState } from './vehicle-usages.state.type';

const initialState: VehicleUsagesState = {
  vehicleUsages: [],
  vehicleUsagesLoaded: false,
  vehicleUsagesLoading: false,
  vehicleUsagesError: null,
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
 * Shared vehicle-usages state for insurance-admin.
 *
 * Loaded once and kept in this root singleton so navigating away from and
 * back to the Vehicle Usages page reads already-fetched state instead of
 * refetching.
 */
export const VehicleUsagesStore: Type<
  {
    vehicleUsages: Signal<VehicleUsageResponseDto[]>;
    vehicleUsagesLoaded: Signal<boolean>;
    vehicleUsagesLoading: Signal<boolean>;
    vehicleUsagesError: Signal<string | null>;
    loadVehicleUsages: (
      query?: GetVehicleUsagesQueryDto,
      page?: HeaderPaginationParams,
    ) => void;
    createVehicleUsage: (
      dto: CreateVehicleUsageDto,
      callbacks: {
        next: (vehicleUsage: VehicleUsageResponseDto) => void;
        error: (message: string) => void;
      },
    ) => void;
    updateVehicleUsage: (
      id: string,
      dto: UpdateVehicleUsageDto,
      callbacks: {
        next: (vehicleUsage: VehicleUsageResponseDto) => void;
        error: (message: string) => void;
      },
    ) => void;
  } & StateSource<VehicleUsagesState>
> = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (
      store: StateSignals<VehicleUsagesState> &
        WritableStateSource<VehicleUsagesState>,
      vehicleUsagesService: VehicleUsagesService = inject(VehicleUsagesService),
    ): {
      loadVehicleUsages: (
        query?: GetVehicleUsagesQueryDto,
        page?: HeaderPaginationParams,
      ) => void;
      createVehicleUsage: (
        dto: CreateVehicleUsageDto,
        callbacks: {
          next: (vehicleUsage: VehicleUsageResponseDto) => void;
          error: (message: string) => void;
        },
      ) => void;
      updateVehicleUsage: (
        id: string,
        dto: UpdateVehicleUsageDto,
        callbacks: {
          next: (vehicleUsage: VehicleUsageResponseDto) => void;
          error: (message: string) => void;
        },
      ) => void;
    } => ({
      loadVehicleUsages(
        query?: GetVehicleUsagesQueryDto,
        page?: HeaderPaginationParams,
      ): void {
        const isLoadAll: boolean =
          (!query || Object.keys(query).length === 0) &&
          (!page || Object.keys(page).length === 0);

        if (isLoadAll) {
          if (store.vehicleUsagesLoaded() || store.vehicleUsagesLoading()) {
            return;
          }
          patchState(store, {
            vehicleUsagesLoading: true,
            vehicleUsagesError: null,
          });
        }

        vehicleUsagesService.list(query ?? {}, page ?? {}).subscribe({
          next: (result: PaginateResult<VehicleUsageResponseDto>): void => {
            if (isLoadAll) {
              patchState(store, {
                vehicleUsages: result.docs,
                vehicleUsagesLoaded: true,
                vehicleUsagesLoading: false,
              });
            } else {
              const existingIds: Set<string> = new Set(
                store
                  .vehicleUsages()
                  .map((item: VehicleUsageResponseDto) => item._id),
              );
              const newItems: VehicleUsageResponseDto[] = result.docs.filter(
                (item: VehicleUsageResponseDto) => !existingIds.has(item._id),
              );
              patchState(store, {
                vehicleUsages: [...store.vehicleUsages(), ...newItems],
              });
            }
          },
          error: (error: unknown): void => {
            if (isLoadAll) {
              patchState(store, {
                vehicleUsagesLoading: false,
                vehicleUsagesError: toErrorMessage(error),
              });
            }
          },
        });
      },

      createVehicleUsage(
        dto: CreateVehicleUsageDto,
        callbacks: {
          next: (vehicleUsage: VehicleUsageResponseDto) => void;
          error: (message: string) => void;
        },
      ): void {
        vehicleUsagesService.create(dto).subscribe({
          next: (created: VehicleUsageResponseDto): void => {
            patchState(store, {
              vehicleUsages: [...store.vehicleUsages(), created],
            });
            callbacks.next(created);
          },
          error: (error: unknown): void => {
            callbacks.error(toErrorMessage(error));
          },
        });
      },

      updateVehicleUsage(
        id: string,
        dto: UpdateVehicleUsageDto,
        callbacks: {
          next: (vehicleUsage: VehicleUsageResponseDto) => void;
          error: (message: string) => void;
        },
      ): void {
        vehicleUsagesService.update(id, dto).subscribe({
          next: (updated: VehicleUsageResponseDto): void => {
            patchState(store, {
              vehicleUsages: store
                .vehicleUsages()
                .map((vehicleUsage: VehicleUsageResponseDto) =>
                  vehicleUsage._id === id ? updated : vehicleUsage,
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
