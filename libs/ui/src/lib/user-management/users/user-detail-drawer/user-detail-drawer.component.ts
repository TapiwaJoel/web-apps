import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  InputSignal,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AuditTrailResponseDto,
  AuditTrailStore,
  RoleResponseDto,
  RolesStore,
  SystemUserResponseDto,
  UpdateSystemUserDto,
  UserStatus,
  UsersStore,
} from '@mushaviri/api';
import { ADMIN_SERVICE_NAME } from '@mushaviri/util';
import { NotificationService } from '../../../services/notification.service';
import { StatusPillComponent } from '../../../status-pill/status-pill.component';
import { UserAuditTrailListComponent } from '../../user-audit-trail-list/user-audit-trail-list.component';
import { StatusTone } from '../../../status-pill/status-tone.type';
import { USER_STATUS_TONES } from '../../types/user-status-tones.const';

interface UserForm {
  name: string;
  phoneNumber: string;
  emailAddress: string;
  role: string;
}

@Component({
  selector: 'org-user-detail-drawer',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    StatusPillComponent,
    UserAuditTrailListComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-detail-drawer.component.html',
})
export class UserDetailDrawerComponent {
  protected readonly UserStatus: typeof UserStatus = UserStatus;

  private readonly router: Router = inject(Router);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly serviceName: string = inject(ADMIN_SERVICE_NAME);
  private readonly usersStore: InstanceType<typeof UsersStore> =
    inject(UsersStore);
  private readonly rolesStore: InstanceType<typeof RolesStore> =
    inject(RolesStore);
  protected readonly auditTrailStore: InstanceType<typeof AuditTrailStore> =
    inject(AuditTrailStore);
  private readonly notificationService: NotificationService =
    inject(NotificationService);

  public readonly userId: InputSignal<string> = input.required<string>();

  protected readonly usersLoading: Signal<boolean> =
    this.usersStore.usersLoading;

  protected readonly roles: Signal<RoleResponseDto[]> = this.rolesStore.roles;

  protected readonly user: Signal<SystemUserResponseDto | undefined> = computed(
    () =>
      this.usersStore
        .users()
        .find((u: SystemUserResponseDto) => u._id === this.userId()),
  );

  private readonly roleNamesById: Signal<Map<string, string>> = computed<
    Map<string, string>
  >(
    () =>
      new Map(
        this.rolesStore
          .roles()
          .map((role: RoleResponseDto) => [role._id, role.name]),
      ),
  );

  protected readonly roleName: Signal<string> = computed(
    () =>
      this.roleNamesById().get(this.user()?.role ?? '') ??
      this.user()?.role ??
      '',
  );

  protected readonly statusTone: Signal<StatusTone> = computed(
    () => USER_STATUS_TONES[this.user()?.status ?? UserStatus.ACTIVE] ?? 'info',
  );

  protected readonly saving: WritableSignal<boolean> = signal(false);

  protected readonly deleting: WritableSignal<boolean> = signal(false);

  protected readonly confirmingDrawerDelete: WritableSignal<boolean> =
    signal(false);

  private readonly editedForm: WritableSignal<UserForm | null> = signal(null);

  protected readonly formValue: Signal<UserForm> = computed(() => {
    const edited: UserForm | null = this.editedForm();
    if (edited) {
      return edited;
    }
    const user: SystemUserResponseDto | undefined = this.user();
    return {
      name: user?.name ?? '',
      phoneNumber: user?.phoneNumber ?? '',
      emailAddress: user?.emailAddress ?? '',
      role: user?.role ?? '',
    };
  });

  protected readonly userAuditTrail: Signal<AuditTrailResponseDto[]> = computed(
    () =>
      this.auditTrailStore
        .auditTrail()
        .filter(
          (entry: AuditTrailResponseDto) =>
            entry.systemUserId === this.userId(),
        ),
  );

  public constructor() {
    this.usersStore.loadUsers({ serviceName: this.serviceName });
    this.rolesStore.loadRoles({ serviceName: this.serviceName });
    this.auditTrailStore.loadAuditTrail();

    effect((): void => {
      const roleId: string | undefined = this.user()?.role;
      if (
        roleId &&
        !this.roles().some((role: RoleResponseDto) => role._id === roleId)
      ) {
        this.rolesStore.loadRoles({ _id: roleId });
      }
    });
  }

  protected updateForm<K extends keyof UserForm>(
    field: K,
    value: UserForm[K],
  ): void {
    this.editedForm.set({ ...this.formValue(), [field]: value });
  }

  protected saveUser(): void {
    this.saving.set(true);
    const { name, role }: Pick<UserForm, 'name' | 'role'> = this.formValue();
    const dto: UpdateSystemUserDto = { name, role };
    this.usersStore.updateUser(this.userId(), dto, {
      next: (): void => {
        this.saving.set(false);
        this.editedForm.set(null);
        this.notificationService.show({
          message: 'User updated successfully.',
          type: 'success',
        });
      },
      error: (message: string): void => {
        this.saving.set(false);
        this.notificationService.show({ message, type: 'error' });
      },
    });
  }

  protected confirmDrawerDelete(): void {
    this.confirmingDrawerDelete.set(true);
  }

  protected cancelDrawerDelete(): void {
    this.confirmingDrawerDelete.set(false);
  }

  protected deleteFromDrawer(): void {
    this.deleting.set(true);
    const dto: UpdateSystemUserDto = { status: UserStatus.DELETED };
    this.usersStore.updateUser(this.userId(), dto, {
      next: (): void => {
        this.deleting.set(false);
        this.confirmingDrawerDelete.set(false);
        this.notificationService.show({
          message: 'User deleted successfully.',
          type: 'success',
        });
        this.close();
      },
      error: (message: string): void => {
        this.deleting.set(false);
        this.notificationService.show({ message, type: 'error' });
      },
    });
  }

  protected restore(): void {
    this.deleting.set(true);
    const dto: UpdateSystemUserDto = { status: UserStatus.ACTIVE };
    this.usersStore.updateUser(this.userId(), dto, {
      next: (): void => {
        this.deleting.set(false);
        this.notificationService.show({
          message: 'User restored successfully.',
          type: 'success',
        });
      },
      error: (message: string): void => {
        this.deleting.set(false);
        this.notificationService.show({ message, type: 'error' });
      },
    });
  }

  protected close(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
