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
  CreateVehicleTypeDto,
  GetVehicleTypesQueryDto,
  UpdateVehicleTypeDto,
  VehicleTypeResponseDto,
} from '../../dtos';
import { VehicleTypesService } from '../../services';
import { HeaderPaginationParams, PaginateResult } from '../../../common';
import { VehicleTypesState } from './vehicle-types.state.type';

const initialState: VehicleTypesState = {
  vehicleTypes: [],
  vehicleTypesLoaded: false,
  vehicleTypesLoading: false,
  vehicleTypesError: null,
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
 * Shared vehicle-types state for insurance-admin.
 *
 * Loaded once and kept in this root singleton so navigating away from and
 * back to the Vehicle Types page reads already-fetched state instead of
 * refetching.
 */
export const VehicleTypesStore: Type<
  {
    vehicleTypes: Signal<VehicleTypeResponseDto[]>;
    vehicleTypesLoaded: Signal<boolean>;
    vehicleTypesLoading: Signal<boolean>;
    vehicleTypesError: Signal<string | null>;
    loadVehicleTypes: (
      query?: GetVehicleTypesQueryDto,
      page?: HeaderPaginationParams,
    ) => void;
    createVehicleType: (
      dto: CreateVehicleTypeDto,
      callbacks: {
        next: (vehicleType: VehicleTypeResponseDto) => void;
        error: (message: string) => void;
      },
    ) => void;
    updateVehicleType: (
      id: string,
      dto: UpdateVehicleTypeDto,
      callbacks: {
        next: (vehicleType: VehicleTypeResponseDto) => void;
        error: (message: string) => void;
      },
    ) => void;
  } & StateSource<VehicleTypesState>
> = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (
      store: StateSignals<VehicleTypesState> &
        WritableStateSource<VehicleTypesState>,
      vehicleTypesService: VehicleTypesService = inject(VehicleTypesService),
    ): {
      loadVehicleTypes: (
        query?: GetVehicleTypesQueryDto,
        page?: HeaderPaginationParams,
      ) => void;
      createVehicleType: (
        dto: CreateVehicleTypeDto,
        callbacks: {
          next: (vehicleType: VehicleTypeResponseDto) => void;
          error: (message: string) => void;
        },
      ) => void;
      updateVehicleType: (
        id: string,
        dto: UpdateVehicleTypeDto,
        callbacks: {
          next: (vehicleType: VehicleTypeResponseDto) => void;
          error: (message: string) => void;
        },
      ) => void;
    } => ({
      loadVehicleTypes(
        query?: GetVehicleTypesQueryDto,
        page?: HeaderPaginationParams,
      ): void {
        const isLoadAll: boolean =
          (!query || Object.keys(query).length === 0) &&
          (!page || Object.keys(page).length === 0);

        if (isLoadAll) {
          if (store.vehicleTypesLoaded() || store.vehicleTypesLoading()) {
            return;
          }
          patchState(store, {
            vehicleTypesLoading: true,
            vehicleTypesError: null,
          });
        }

        vehicleTypesService.list(query ?? {}, page ?? {}).subscribe({
          next: (result: PaginateResult<VehicleTypeResponseDto>): void => {
            if (isLoadAll) {
              patchState(store, {
                vehicleTypes: result.docs,
                vehicleTypesLoaded: true,
                vehicleTypesLoading: false,
              });
            } else {
              const existingIds: Set<string> = new Set(
                store
                  .vehicleTypes()
                  .map((item: VehicleTypeResponseDto) => item._id),
              );
              const newItems: VehicleTypeResponseDto[] = result.docs.filter(
                (item: VehicleTypeResponseDto) => !existingIds.has(item._id),
              );
              patchState(store, {
                vehicleTypes: [...store.vehicleTypes(), ...newItems],
              });
            }
          },
          error: (error: unknown): void => {
            if (isLoadAll) {
              patchState(store, {
                vehicleTypesLoading: false,
                vehicleTypesError: toErrorMessage(error),
              });
            }
          },
        });
      },

      createVehicleType(
        dto: CreateVehicleTypeDto,
        callbacks: {
          next: (vehicleType: VehicleTypeResponseDto) => void;
          error: (message: string) => void;
        },
      ): void {
        vehicleTypesService.create(dto).subscribe({
          next: (created: VehicleTypeResponseDto): void => {
            patchState(store, {
              vehicleTypes: [...store.vehicleTypes(), created],
            });
            callbacks.next(created);
          },
          error: (error: unknown): void => {
            callbacks.error(toErrorMessage(error));
          },
        });
      },

      updateVehicleType(
        id: string,
        dto: UpdateVehicleTypeDto,
        callbacks: {
          next: (vehicleType: VehicleTypeResponseDto) => void;
          error: (message: string) => void;
        },
      ): void {
        vehicleTypesService.update(id, dto).subscribe({
          next: (updated: VehicleTypeResponseDto): void => {
            patchState(store, {
              vehicleTypes: store
                .vehicleTypes()
                .map((vehicleType: VehicleTypeResponseDto) =>
                  vehicleType._id === id ? updated : vehicleType,
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
