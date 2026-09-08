import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  DeviceResponseDto,
  DevicesService,
  SystemUserResponseDto,
  UserResponseDto,
  UserStatus,
} from '@mushaviri/api';
import { SessionStore } from '@mushaviri/util';
import { NotificationService } from '@mushaviri/ui';
import { StatusTone, STATUS_TONES } from '../../shared/types/users/users.types';
import {
  DeviceRow,
  deviceTypeIconFor,
} from '../../shared/types/profile/profile.types';

@Component({
  selector: 'org-profile',
  standalone: true,
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile.component.html',
})
export class ProfileComponent {
  private readonly session: SessionStore = inject(SessionStore);
  private readonly devicesService: DevicesService = inject(DevicesService);
  private readonly notificationService: NotificationService =
    inject(NotificationService);

  protected readonly user: Signal<UserResponseDto | null> = this.session.user;
  protected readonly systemUser: Signal<SystemUserResponseDto | null> =
    this.session.systemUser;
  protected readonly roleName: Signal<string | null> = this.session.roleName;
  protected readonly roleDescription: Signal<string | null> =
    this.session.roleDescription;
  protected readonly isTwoFactorEnabled: Signal<boolean> =
    this.session.isTwoFactorEnabled;
  protected readonly currentDeviceId: Signal<string | null> =
    this.session.currentDeviceId;
  protected readonly accountCreatedAt: Signal<string | null> =
    this.session.accountCreatedAt;
  protected readonly accountUpdatedAt: Signal<string | null> =
    this.session.accountUpdatedAt;

  protected readonly devices: WritableSignal<Partial<DeviceResponseDto>[]> =
    signal([]);
  protected readonly devicesLoading: WritableSignal<boolean> = signal(true);
  protected readonly devicesError: WritableSignal<string | null> = signal(null);

  /** deviceId currently showing the inline "confirm deactivate?" prompt. */
  protected readonly confirmingDeviceId: WritableSignal<string | null> =
    signal(null);
  /** deviceId currently mid-PATCH-request. */
  protected readonly deactivatingDeviceId: WritableSignal<string | null> =
    signal(null);

  protected readonly initials: Signal<string> = computed<string>(() =>
    (this.user()?.name ?? '')
      .split(' ')
      .filter((word: string): boolean => word.length > 0)
      .map((word: string) => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
  );

  protected readonly displayRole: Signal<string> = computed<string>(
    () => this.roleName() ?? this.user()?.role ?? '',
  );

  protected readonly userStatusTone: Signal<StatusTone> = computed<StatusTone>(
    () => {
      const status: UserStatus | undefined = this.user()?.status;
      return status ? (STATUS_TONES[status] ?? 'info') : 'info';
    },
  );

  protected readonly deviceRows: Signal<DeviceRow[]> = computed<DeviceRow[]>(
    () =>
      this.devices().map((device: Partial<DeviceResponseDto>): DeviceRow => ({
        ...device,
        icon: deviceTypeIconFor(device.deviceType),
      })),
  );

  public constructor() {
    this.devicesService.list().subscribe({
      next: (result): void => {
        this.devices.set(result.docs);
        this.devicesLoading.set(false);
      },
      error: (error: unknown): void => {
        this.devicesLoading.set(false);
        this.devicesError.set(this.toErrorMessage(error));
      },
    });
  }

  protected requestDeactivate(deviceId: string | undefined): void {
    if (!deviceId) {
      return;
    }
    this.confirmingDeviceId.set(deviceId);
  }

  protected cancelDeactivate(): void {
    this.confirmingDeviceId.set(null);
  }

  protected confirmDeactivate(deviceId: string | undefined): void {
    if (!deviceId) {
      return;
    }
    this.deactivatingDeviceId.set(deviceId);

    this.devicesService.update(deviceId, { isActive: false }).subscribe({
      next: (updated: DeviceResponseDto): void => {
        this.devices.update((current: Partial<DeviceResponseDto>[]) =>
          current.map((device: Partial<DeviceResponseDto>) =>
            device.deviceId === deviceId ? updated : device,
          ),
        );
        this.deactivatingDeviceId.set(null);
        this.confirmingDeviceId.set(null);
        this.notificationService.show({
          message: 'Device deactivated and signed out.',
          type: 'success',
        });
      },
      error: (error: unknown): void => {
        this.deactivatingDeviceId.set(null);
        this.notificationService.show({
          message: this.toErrorMessage(error),
          type: 'error',
        });
      },
    });
  }

  /** `mapHttpError` surfaces the backend's ServiceResponse.message as `ApiError`. */
  private toErrorMessage(error: unknown): string {
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
}
