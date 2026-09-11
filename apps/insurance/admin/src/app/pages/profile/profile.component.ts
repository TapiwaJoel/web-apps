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
  DevicesStore,
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
  private readonly store: InstanceType<typeof DevicesStore> =
    inject(DevicesStore);
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

  protected readonly devices: Signal<Partial<DeviceResponseDto>[]> =
    this.store.devices;
  protected readonly devicesLoading: Signal<boolean> =
    this.store.devicesLoading;
  protected readonly devicesError: Signal<string | null> =
    this.store.devicesError;

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
    this.store.loadDevices();
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

    this.store.deactivateDevice(deviceId, {
      next: (): void => {
        this.deactivatingDeviceId.set(null);
        this.confirmingDeviceId.set(null);
        this.notificationService.show({
          message: 'Device deactivated and signed out.',
          type: 'success',
        });
      },
      error: (message: string): void => {
        this.deactivatingDeviceId.set(null);
        this.notificationService.show({ message, type: 'error' });
      },
    });
  }
}
