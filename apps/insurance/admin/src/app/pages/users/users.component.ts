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
  CreateSystemUserDto,
  RoleResponseDto,
  RolesStore,
  SystemUserResponseDto,
  UsersStore,
} from '@mushaviri/api';
import { NotificationService } from '@mushaviri/ui';
import { CreateUserDialogComponent } from './create-user-dialogue/create-user-dialog.component';
import {
  STATUS_TONES,
  SystemUserRow,
} from '../../shared/types/users/users.types';

@Component({
  selector: 'org-users',
  standalone: true,
  imports: [DatePipe, CreateUserDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './users.component.html',
})
export class UsersComponent {
  private readonly store: InstanceType<typeof UsersStore> = inject(UsersStore);
  private readonly rolesStore: InstanceType<typeof RolesStore> =
    inject(RolesStore);
  private readonly notificationService: NotificationService =
    inject(NotificationService);

  protected readonly users: Signal<SystemUserResponseDto[]> = this.store.users;
  protected readonly usersLoading: Signal<boolean> = this.store.usersLoading;
  protected readonly usersError: Signal<string | null> = this.store.usersError;
  protected readonly roles: Signal<RoleResponseDto[]> = this.rolesStore.roles;

  protected readonly showCreateForm: WritableSignal<boolean> = signal(false);
  protected readonly creating: WritableSignal<boolean> = signal(false);

  private readonly roleNamesById: Signal<Map<string, string>> = computed<
    Map<string, string>
  >(
    () =>
      new Map(
        this.roles().map((role: RoleResponseDto) => [role._id, role.name]),
      ),
  );

  protected readonly rows: Signal<SystemUserRow[]> = computed<SystemUserRow[]>(
    () =>
      this.users().map((user: SystemUserResponseDto): SystemUserRow => ({
        ...user,
        statusTone: STATUS_TONES[user.status] ?? 'info',
        roleName: this.roleNamesById().get(user.role) ?? user.role,
      })),
  );

  public constructor() {
    this.store.loadUsers();
    this.rolesStore.loadRoles();
  }

  protected openCreateForm(): void {
    this.showCreateForm.set(true);
  }

  protected cancelCreate(): void {
    this.showCreateForm.set(false);
  }

  protected submitCreate(dto: CreateSystemUserDto): void {
    this.creating.set(true);

    this.store.createUser(dto, {
      next: (): void => {
        this.creating.set(false);
        this.showCreateForm.set(false);
        this.notificationService.show({
          message: 'User created successfully.',
          type: 'success',
        });
      },
      error: (message: string): void => {
        this.creating.set(false);
        this.notificationService.show({ message, type: 'error' });
      },
    });
  }
}
