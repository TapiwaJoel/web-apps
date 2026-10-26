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
import { NotificationService } from '../../services/notification.service';
import { StatusTone } from '../../status-pill/status-tone.type';
import { USER_STATUS_TONES } from '../types/user-status-tones.const';
import { DeviceRow } from '../types/device-row.type';
import { deviceTypeIconFor } from '../types/device-type-icon.util';

@Component({
  selector: 'org-profile',
  standalone: true,
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  private readonly session: SessionStore = inject(SessionStore);
  private readonly store: InstanceType<typeof DevicesStore> =
    inject(DevicesStore);
  private readonly notificationService: NotificationService =
    inject(NotificationService);

  protected readonly systemUser: Signal<SystemUserResponseDto | null> =
    this.session.systemUser;
  protected readonly user: Signal<UserResponseDto | null> = this.session.user;
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
    (this.systemUser()?.name ?? '')
      .split(' ')
      .filter((word: string): boolean => word.length > 0)
      .map((word: string) => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
  );

  protected readonly displayRole: Signal<string> = computed<string>(
    () => this.roleName() ?? this.systemUser()?.role ?? '',
  );

  protected readonly userStatusTone: Signal<StatusTone> = computed<StatusTone>(
    () => {
      const status: UserStatus | undefined = this.systemUser()?.status;
      return status ? (USER_STATUS_TONES[status] ?? 'info') : 'info';
    },
  );

  /**
   * The corporate/underlying account is only worth showing separately when
   * it actually diverges from the product system user - otherwise it's
   * just noise repeating the same details.
   */
  protected readonly showCorporateAccount: Signal<boolean> = computed<boolean>(
    () => {
      const user: UserResponseDto | null = this.user();
      const systemUser: SystemUserResponseDto | null = this.systemUser();
      if (!user || !systemUser) {
        return false;
      }
      return (
        user.name !== systemUser.name ||
        user.phoneNumber !== systemUser.phoneNumber ||
        user.emailAddress !== systemUser.emailAddress ||
        user.country !== systemUser.country
      );
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

    this.store.updateDevice(
      deviceId,
      { isActive: false },
      {
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
      },
    );
  }
}
