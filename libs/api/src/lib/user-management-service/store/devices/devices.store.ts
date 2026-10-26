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
import { DeviceResponseDto, GetDevicesQueryDto } from '../../dtos';
import { DevicesService } from '../../services';
import { PaginateResult } from '../../../common';
import { DevicesState } from './devices.state.type';

const initialState: DevicesState = {
  devices: [],
  devicesLoaded: false,
  devicesLoading: false,
  devicesError: null,
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
 * Shared device-session state for insurance-admin's Profile page.
 *
 * Loaded once and kept in this root singleton so navigating away from and
 * back to the Profile page reads already-fetched state instead of refetching.
 */
export const DevicesStore: Type<
  {
    devices: Signal<Partial<DeviceResponseDto>[]>;
    devicesLoaded: Signal<boolean>;
    devicesLoading: Signal<boolean>;
    devicesError: Signal<string | null>;
    loadDevices: (query?: GetDevicesQueryDto) => void;
    updateDevice: (
      deviceId: string,
      dto: Partial<DeviceResponseDto>,
      callbacks: { next: () => void; error: (message: string) => void },
    ) => void;
  } & StateSource<DevicesState>
> = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (
      store: StateSignals<DevicesState> & WritableStateSource<DevicesState>,
      devicesService: DevicesService = inject(DevicesService),
    ): {
      loadDevices: (query?: GetDevicesQueryDto) => void;
      updateDevice: (
        deviceId: string,
        dto: Partial<DeviceResponseDto>,
        callbacks: { next: () => void; error: (message: string) => void },
      ) => void;
    } => ({
      loadDevices(query?: GetDevicesQueryDto): void {
        const isLoadAll: boolean =
          query === undefined || Object.keys(query).length === 0;

        if (isLoadAll) {
          if (store.devicesLoaded() || store.devicesLoading()) {
            return;
          }
          patchState(store, { devicesLoading: true, devicesError: null });
        }

        devicesService.list(query ?? {}).subscribe({
          next: (result: PaginateResult<DeviceResponseDto>): void => {
            if (isLoadAll) {
              patchState(store, {
                devices: result.docs,
                devicesLoaded: true,
                devicesLoading: false,
              });
            } else {
              const existingIds: Set<string | undefined> = new Set(
                store
                  .devices()
                  .map((device: Partial<DeviceResponseDto>) => device.deviceId),
              );
              const newDevices: DeviceResponseDto[] = result.docs.filter(
                (device: DeviceResponseDto) =>
                  !existingIds.has(device.deviceId),
              );
              patchState(store, {
                devices: [...store.devices(), ...newDevices],
              });
            }
          },
          error: (error: unknown): void => {
            if (isLoadAll) {
              patchState(store, {
                devicesLoading: false,
                devicesError: toErrorMessage(error),
              });
            }
          },
        });
      },

      updateDevice(
        deviceId: string,
        dto: Partial<DeviceResponseDto>,
        callbacks: { next: () => void; error: (message: string) => void },
      ): void {
        devicesService.update(deviceId, dto).subscribe({
          next: (updated: DeviceResponseDto): void => {
            patchState(store, {
              devices: store
                .devices()
                .map((device: Partial<DeviceResponseDto>) =>
                  device.deviceId === deviceId ? updated : device,
                ),
            });
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
