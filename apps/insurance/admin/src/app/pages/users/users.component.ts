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
  INSURANCE_PATH,
  RoleResponseDto,
  RolesService,
  SystemUserResponseDto,
  SystemUsersService,
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
  private readonly systemUsersService: SystemUsersService =
    inject(SystemUsersService);
  private readonly rolesService: RolesService = inject(RolesService);
  private readonly notificationService: NotificationService =
    inject(NotificationService);

  protected readonly users: WritableSignal<SystemUserResponseDto[]> = signal(
    [],
  );
  protected readonly usersLoading: WritableSignal<boolean> = signal(true);
  protected readonly usersError: WritableSignal<string | null> = signal(null);

  protected readonly roles: WritableSignal<RoleResponseDto[]> = signal([]);

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
    this.loadUsers();

    this.rolesService.list({ serviceName: INSURANCE_PATH }).subscribe({
      next: (result): void => this.roles.set(result.docs),
      error: (): void => this.roles.set([]),
    });
  }

  protected openCreateForm(): void {
    this.showCreateForm.set(true);
  }

  protected cancelCreate(): void {
    this.showCreateForm.set(false);
  }

  protected submitCreate(dto: CreateSystemUserDto): void {
    this.creating.set(true);

    this.systemUsersService.create(dto).subscribe({
      next: (): void => {
        this.creating.set(false);
        this.showCreateForm.set(false);
        this.notificationService.show({
          message: 'User created successfully.',
          type: 'success',
        });
        this.loadUsers();
      },
      error: (error: unknown): void => {
        this.creating.set(false);
        this.notificationService.show({
          message: this.toErrorMessage(error),
          type: 'error',
        });
      },
    });
  }

  private loadUsers(): void {
    this.usersLoading.set(true);
    this.usersError.set(null);

    this.systemUsersService.list({ serviceName: INSURANCE_PATH }).subscribe({
      next: (result): void => {
        this.users.set(result.docs);
        this.usersLoading.set(false);
      },
      error: (error: unknown): void => {
        this.usersLoading.set(false);
        this.usersError.set(this.toErrorMessage(error));
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
