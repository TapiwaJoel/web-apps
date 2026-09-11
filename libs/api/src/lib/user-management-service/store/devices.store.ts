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
import { DeviceResponseDto } from '../dtos';
import { DevicesService } from '../services';
import { PaginateResult } from '../../common';

export interface DevicesState {
  devices: Partial<DeviceResponseDto>[];
  devicesLoaded: boolean;
  devicesLoading: boolean;
  devicesError: string | null;
}

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
    loadDevices: () => void;
    deactivateDevice: (
      deviceId: string,
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
      loadDevices: () => void;
      deactivateDevice: (
        deviceId: string,
        callbacks: { next: () => void; error: (message: string) => void },
      ) => void;
    } => ({
      loadDevices(): void {
        if (store.devicesLoaded() || store.devicesLoading()) {
          return;
        }
        patchState(store, { devicesLoading: true, devicesError: null });
        devicesService.list().subscribe({
          next: (result: PaginateResult<DeviceResponseDto>): void => {
            patchState(store, {
              devices: result.docs,
              devicesLoaded: true,
              devicesLoading: false,
            });
          },
          error: (error: unknown): void => {
            patchState(store, {
              devicesLoading: false,
              devicesError: toErrorMessage(error),
            });
          },
        });
      },

      deactivateDevice(
        deviceId: string,
        callbacks: { next: () => void; error: (message: string) => void },
      ): void {
        devicesService.update(deviceId, { isActive: false }).subscribe({
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
