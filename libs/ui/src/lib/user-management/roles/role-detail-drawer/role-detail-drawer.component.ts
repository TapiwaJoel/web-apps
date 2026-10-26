import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  InputSignal,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OverlayModule } from '@angular/cdk/overlay';
import { ActivatedRoute, Router } from '@angular/router';
import {
  EntityStatus,
  PermissionResponseDto,
  PermissionsStore,
  RolePermissionResponseDto,
  RolePermissionsStore,
  RoleResponseDto,
  RolesStore,
  UpdateRoleDto,
} from '@mushaviri/api';
import { ADMIN_SERVICE_NAME } from '@mushaviri/util';
import { NotificationService } from '../../../services/notification.service';
import { StatusPillComponent } from '../../../status-pill/status-pill.component';
import { StatusTone } from '../../../status-pill/status-tone.type';
import { ENTITY_STATUS_TONES } from '../../types/entity-status-tones.const';

interface PermissionGroup {
  resource: string;
  permissions: PermissionResponseDto[];
}

interface RoleForm {
  name: string;
  description: string;
  isSensitive: boolean;
}

@Component({
  selector: 'org-role-detail-drawer',
  standalone: true,
  imports: [FormsModule, OverlayModule, StatusPillComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './role-detail-drawer.component.html',
})
export class RoleDetailDrawerComponent {
  protected readonly EntityStatus: typeof EntityStatus = EntityStatus;

  private readonly router: Router = inject(Router);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly serviceName: string = inject(ADMIN_SERVICE_NAME);
  private readonly rolesStore: InstanceType<typeof RolesStore> =
    inject(RolesStore);
  private readonly permissionsStore: InstanceType<typeof PermissionsStore> =
    inject(PermissionsStore);
  private readonly rolePermissionsStore: InstanceType<
    typeof RolePermissionsStore
  > = inject(RolePermissionsStore);
  private readonly notificationService: NotificationService =
    inject(NotificationService);

  public readonly roleId: InputSignal<string> = input.required<string>();

  protected readonly rolesLoading: Signal<boolean> =
    this.rolesStore.rolesLoading;
  protected readonly permissionsLoading: Signal<boolean> =
    this.permissionsStore.permissionsLoading;
  protected readonly permissionsError: Signal<string | null> =
    this.permissionsStore.permissionsError;

  protected readonly role: Signal<RoleResponseDto | undefined> = computed(() =>
    this.rolesStore
      .roles()
      .find((r: RoleResponseDto) => r._id === this.roleId()),
  );

  protected readonly statusTone: Signal<StatusTone> = computed(
    () =>
      ENTITY_STATUS_TONES[this.role()?.status ?? EntityStatus.ACTIVE] ?? 'info',
  );

  protected readonly saving: WritableSignal<boolean> = signal(false);

  protected readonly deleting: WritableSignal<boolean> = signal(false);

  protected readonly confirmingDrawerDelete: WritableSignal<boolean> =
    signal(false);

  protected readonly permissionSearch: WritableSignal<string> = signal('');

  private readonly editedForm: WritableSignal<RoleForm | null> = signal(null);

  protected readonly formValue: Signal<RoleForm> = computed(() => {
    const edited: RoleForm | null = this.editedForm();
    if (edited) {
      return edited;
    }
    const role: RoleResponseDto | undefined = this.role();
    return {
      name: role?.name ?? '',
      description: role?.description ?? '',
      isSensitive: role?.isSensitive ?? false,
    };
  });

  protected readonly unassignedGroups: Signal<PermissionGroup[]> = computed(
    () => {
      const term: string = this.permissionSearch().trim().toLowerCase();
      const assigned: Set<string> = this.assignedPermissionIds();
      const matches: (permission: PermissionResponseDto) => boolean = (
        permission: PermissionResponseDto,
      ): boolean =>
        term === '' ||
        permission.name.toLowerCase().includes(term) ||
        permission.description.toLowerCase().includes(term) ||
        permission.resource.toLowerCase().includes(term);

      const byResource: Map<string, PermissionResponseDto[]> = new Map();
      for (const permission of this.permissionsStore.permissions()) {
        if (
          permission.status !== EntityStatus.ACTIVE ||
          assigned.has(permission._id) ||
          !matches(permission)
        ) {
          continue;
        }
        const group: PermissionResponseDto[] =
          byResource.get(permission.resource) ?? [];
        group.push(permission);
        byResource.set(permission.resource, group);
      }
      return Array.from(byResource.entries())
        .map(([resource, permissions]): PermissionGroup => ({
          resource,
          permissions,
        }))
        .sort((a: PermissionGroup, b: PermissionGroup) =>
          a.resource.localeCompare(b.resource),
        );
    },
  );

  protected readonly hasAnyPermissions: Signal<boolean> = computed(
    () => this.permissionsStore.permissions().length > 0,
  );

  protected readonly assignedPermissions: Signal<PermissionResponseDto[]> =
    computed(() => {
      const assigned: Set<string> = this.assignedPermissionIds();
      return this.permissionsStore
        .permissions()
        .filter((permission: PermissionResponseDto) =>
          assigned.has(permission._id),
        )
        .sort((a: PermissionResponseDto, b: PermissionResponseDto) =>
          a.name.localeCompare(b.name),
        );
    });

  protected readonly dropdownOpen: WritableSignal<boolean> = signal(false);

  private readonly activeAssignments: Signal<
    Map<string, RolePermissionResponseDto>
  > = computed(() => {
    const map: Map<string, RolePermissionResponseDto> = new Map();
    for (const rolePermission of this.rolePermissionsStore.rolePermissions()) {
      if (
        rolePermission.roleId === this.roleId() &&
        rolePermission.status === EntityStatus.ACTIVE
      ) {
        map.set(rolePermission.permissionId, rolePermission);
      }
    }
    return map;
  });

  protected readonly assignedPermissionIds: Signal<Set<string>> = computed(
    () => new Set(this.activeAssignments().keys()),
  );

  protected readonly permissionCount: Signal<number> = computed(
    () => this.assignedPermissionIds().size,
  );

  protected readonly togglingPermissionId: WritableSignal<string | null> =
    signal(null);

  public constructor() {
    this.rolesStore.loadRoles({ serviceName: this.serviceName });
    this.permissionsStore.loadPermissions();
    this.rolePermissionsStore.loadRolePermissions();
  }

  protected updateForm<K extends keyof RoleForm>(
    field: K,
    value: RoleForm[K],
  ): void {
    this.editedForm.set({ ...this.formValue(), [field]: value });
  }

  protected updatePermissionSearch(term: string): void {
    this.permissionSearch.set(term);
  }

  protected saveRole(): void {
    this.saving.set(true);
    const { name, description, isSensitive }: RoleForm = this.formValue();
    const dto: UpdateRoleDto = {
      name,
      description: description || undefined,
      isSensitive,
    };
    this.rolesStore.updateRole(this.roleId(), dto, {
      next: (): void => {
        this.saving.set(false);
        this.editedForm.set(null);
        this.notificationService.show({
          message: 'Role updated successfully.',
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
    this.rolesStore.updateRole(
      this.roleId(),
      { status: EntityStatus.DELETED },
      {
        next: (): void => {
          this.deleting.set(false);
          this.confirmingDrawerDelete.set(false);
          this.notificationService.show({
            message: 'Role deleted successfully.',
            type: 'success',
          });
          this.close();
        },
        error: (message: string): void => {
          this.deleting.set(false);
          this.notificationService.show({ message, type: 'error' });
        },
      },
    );
  }

  protected restore(): void {
    this.deleting.set(true);
    const dto: UpdateRoleDto = { status: EntityStatus.ACTIVE };
    this.rolesStore.updateRole(this.roleId(), dto, {
      next: (): void => {
        this.deleting.set(false);
        this.notificationService.show({
          message: 'Role restored successfully.',
          type: 'success',
        });
      },
      error: (message: string): void => {
        this.deleting.set(false);
        this.notificationService.show({ message, type: 'error' });
      },
    });
  }

  protected isAssigned(permissionId: string): boolean {
    return this.assignedPermissionIds().has(permissionId);
  }

  protected toggleDropdown(): void {
    this.dropdownOpen.update((open: boolean) => !open);
  }

  protected closeDropdown(): void {
    this.dropdownOpen.set(false);
  }

  protected assign(permissionId: string): void {
    if (this.togglingPermissionId()) {
      return;
    }
    this.togglingPermissionId.set(permissionId);
    this.rolePermissionsStore.createRolePermission(
      { roleId: this.roleId(), permissionId },
      {
        next: (): void => {
          this.togglingPermissionId.set(null);
        },
        error: (message: string): void => {
          this.togglingPermissionId.set(null);
          this.notificationService.show({ message, type: 'error' });
        },
      },
    );
  }

  protected revoke(permissionId: string): void {
    if (this.togglingPermissionId()) {
      return;
    }
    const assignment: RolePermissionResponseDto | undefined =
      this.activeAssignments().get(permissionId);
    if (!assignment) {
      return;
    }
    this.togglingPermissionId.set(permissionId);
    this.rolePermissionsStore.updateRolePermission(
      assignment._id,
      { status: EntityStatus.DELETED },
      {
        next: (): void => {
          this.togglingPermissionId.set(null);
        },
        error: (message: string): void => {
          this.togglingPermissionId.set(null);
          this.notificationService.show({ message, type: 'error' });
        },
      },
    );
  }

  protected close(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
