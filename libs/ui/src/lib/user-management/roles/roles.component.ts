import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  EffectRef,
  inject,
  Injector,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { OverlayModule } from '@angular/cdk/overlay';
import {
  CreateRoleDto,
  EntityStatus,
  PermissionResponseDto,
  PermissionsStore,
  RolePermissionsStore,
  RoleResponseDto,
  RolesStore,
} from '@mushaviri/api';
import {
  ADMIN_SERVICE_NAME,
  ColumnFilter,
  containsPredicate,
  dateRangePredicate,
  equalsPredicate,
  filterRows,
  GlobalSearchService,
  paginateRows,
  searchRows,
  SortDirection,
  sortRows,
} from '@mushaviri/util';
import { NotificationService } from '../../services/notification.service';
import { SortableColumnHeaderComponent } from '../../sortable-column-header/sortable-column-header.component';
import { TablePaginationComponent } from '../../table-pagination/table-pagination.component';
import { CreateRoleDialogComponent } from './create-role-dialog/create-role-dialog.component';
import { RoleDetailDrawerComponent } from './role-detail-drawer/role-detail-drawer.component';
import { StatusPillComponent } from '../../status-pill/status-pill.component';
import { KpiStatCardComponent } from '../../kpi-stat-card/kpi-stat-card.component';
import { KpiCard } from '../../kpi-stat-card/kpi-card.type';
import { INITIAL_ROLE_FILTERS } from '../types/initial-role-filters.const';
import { RoleColumnKey } from '../types/role-column-key.type';
import { RoleFilters } from '../types/role-filters.type';
import { RoleRow } from '../types/role-row.type';
import { ENTITY_STATUS_TONES } from '../types/entity-status-tones.const';
import { selectAutoAssignPermissions } from '@mushaviri/util';

const DEFAULT_PAGE_SIZE: number = 10;

@Component({
  selector: 'org-roles',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    RouterLink,
    OverlayModule,
    CreateRoleDialogComponent,
    RoleDetailDrawerComponent,
    StatusPillComponent,
    TablePaginationComponent,
    SortableColumnHeaderComponent,
    KpiStatCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './roles.component.html',
})
export class RolesComponent {
  protected readonly EntityStatus: typeof EntityStatus = EntityStatus;

  private readonly store: InstanceType<typeof RolesStore> = inject(RolesStore);
  private readonly permissionsStore: InstanceType<typeof PermissionsStore> =
    inject(PermissionsStore);
  private readonly rolePermissionsStore: InstanceType<
    typeof RolePermissionsStore
  > = inject(RolePermissionsStore);
  private readonly notificationService: NotificationService =
    inject(NotificationService);
  private readonly globalSearch: GlobalSearchService =
    inject(GlobalSearchService);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly serviceName: string = inject(ADMIN_SERVICE_NAME);
  private readonly injector: Injector = inject(Injector);

  protected readonly selectedRoleId: Signal<string | null> = toSignal(
    this.route.paramMap.pipe(map((params: ParamMap) => params.get('id'))),
    { initialValue: null },
  );

  protected readonly rolesLoading: Signal<boolean> = this.store.rolesLoading;
  protected readonly rolesError: Signal<string | null> = this.store.rolesError;

  protected readonly showCreateForm: WritableSignal<boolean> = signal(false);
  protected readonly creating: WritableSignal<boolean> = signal(false);
  protected readonly openMenuId: WritableSignal<string | null> = signal(null);

  protected readonly filters: WritableSignal<RoleFilters> = signal({
    ...INITIAL_ROLE_FILTERS,
  });
  protected readonly filtersOpen: WritableSignal<boolean> = signal(false);
  protected readonly sortKey: WritableSignal<RoleColumnKey | null> =
    signal(null);
  protected readonly sortDirection: WritableSignal<SortDirection> =
    signal(null);
  protected readonly page: WritableSignal<number> = signal(1);
  protected readonly pageSize: WritableSignal<number> =
    signal(DEFAULT_PAGE_SIZE);

  protected readonly rows: Signal<RoleRow[]> = computed<RoleRow[]>(() =>
    this.store.roles().map((role: RoleResponseDto): RoleRow => ({
      ...role,
      statusTone: ENTITY_STATUS_TONES[role.status] ?? 'info',
    })),
  );

  protected readonly permissionCounts: Signal<Map<string, number>> = computed(
    () => {
      const counts: Map<string, number> = new Map();
      for (const rolePermission of this.rolePermissionsStore.rolePermissions()) {
        if (rolePermission.status !== EntityStatus.ACTIVE) {
          continue;
        }
        counts.set(
          rolePermission.roleId,
          (counts.get(rolePermission.roleId) ?? 0) + 1,
        );
      }
      return counts;
    },
  );

  protected readonly roleStats: Signal<KpiCard[]> = computed<KpiCard[]>(() => {
    const all: RoleRow[] = this.rows();
    return [
      {
        label: 'Total Roles',
        value: String(all.length),
        icon: 'fi fi-rr-shield',
      },
      {
        label: 'Active',
        value: String(
          all.filter((role: RoleRow) => role.status === EntityStatus.ACTIVE)
            .length,
        ),
        icon: 'fi fi-rr-check-circle',
      },
      {
        label: 'Sensitive',
        value: String(all.filter((role: RoleRow) => role.isSensitive).length),
        icon: 'fi fi-rr-lock',
      },
      {
        label: 'Deleted',
        value: String(
          all.filter((role: RoleRow) => role.status === EntityStatus.DELETED)
            .length,
        ),
        icon: 'fi fi-rr-trash',
      },
    ];
  });

  protected readonly statusOptions: Signal<string[]> = computed<string[]>(() =>
    Array.from(
      new Set(this.rows().map((role: RoleRow): string => role.status)),
    ),
  );

  protected readonly activeFilterCount: Signal<number> = computed<number>(
    () =>
      Object.values(this.filters()).filter(
        (value: string | null): boolean => value !== '' && value !== null,
      ).length,
  );

  private readonly columnFilters: Signal<ColumnFilter<RoleRow>[]> = computed<
    ColumnFilter<RoleRow>[]
  >(() => {
    const current: RoleFilters = this.filters();
    return [
      {
        accessor: (role: RoleRow): string => role.name,
        predicate: containsPredicate,
        value: current.name,
      },
      {
        accessor: (role: RoleRow): string => role.description ?? '',
        predicate: containsPredicate,
        value: current.description,
      },
      {
        accessor: (role: RoleRow): boolean => role.isSensitive,
        predicate: equalsPredicate,
        value: current.isSensitive === '' ? '' : current.isSensitive === 'true',
      },
      {
        accessor: (role: RoleRow): string => role.status,
        predicate: equalsPredicate,
        value: current.status,
      },
      {
        accessor: (role: RoleRow): Date => new Date(role.createdAt),
        predicate: dateRangePredicate,
        value: { from: current.createdFrom, to: current.createdTo },
      },
    ];
  });

  protected readonly filteredRows: Signal<RoleRow[]> = computed<RoleRow[]>(
    () => {
      const filtered: RoleRow[] = filterRows(this.rows(), this.columnFilters());
      return searchRows(filtered, this.globalSearch.query(), [
        (role: RoleRow): string => role.name,
        (role: RoleRow): string => role.description ?? '',
        (role: RoleRow): string => role.status,
      ]);
    },
  );

  protected readonly filteredTotal: Signal<number> = computed<number>(
    () => this.filteredRows().length,
  );

  private readonly sortedRows: Signal<RoleRow[]> = computed<RoleRow[]>(() => {
    const key: RoleColumnKey | null = this.sortKey();
    const accessor: ((role: RoleRow) => unknown) | null = key
      ? (role: RoleRow): unknown =>
          key === 'createdAt' ? new Date(role.createdAt) : role[key]
      : null;
    return sortRows(this.filteredRows(), accessor, this.sortDirection());
  });

  protected readonly pagedRows: Signal<RoleRow[]> = computed<RoleRow[]>(() =>
    paginateRows(this.sortedRows(), this.page(), this.pageSize()),
  );

  public constructor() {
    this.store.loadRoles({ serviceName: this.serviceName });
    this.permissionsStore.loadPermissions();
    this.rolePermissionsStore.loadRolePermissions();

    this.globalSearch.placeholder.set('Search roles…');
    inject(DestroyRef).onDestroy((): void => {
      this.globalSearch.placeholder.set('Search...');
      this.globalSearch.query.set('');
    });

    effect((): void => {
      this.globalSearch.query();
      this.page.set(1);
    });
  }

  protected onFilterChange<K extends keyof RoleFilters>(
    key: K,
    value: RoleFilters[K],
  ): void {
    this.filters.update((current: RoleFilters): RoleFilters => ({
      ...current,
      [key]: value,
    }));
    this.page.set(1);
  }

  protected toggleFilters(): void {
    this.filtersOpen.update((open: boolean) => !open);
  }

  protected closeFilters(): void {
    this.filtersOpen.set(false);
  }

  protected resetFilters(): void {
    this.filters.set({ ...INITIAL_ROLE_FILTERS });
    this.page.set(1);
  }

  protected onSortChange(key: RoleColumnKey, direction: SortDirection): void {
    this.sortKey.set(direction ? key : null);
    this.sortDirection.set(direction);
  }

  protected onPageChange(page: number): void {
    this.page.set(page);
  }

  protected onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.page.set(1);
  }

  protected openCreateForm(): void {
    this.showCreateForm.set(true);
  }

  protected cancelCreate(): void {
    this.showCreateForm.set(false);
  }

  protected submitCreate(dto: CreateRoleDto): void {
    this.creating.set(true);

    this.store.createRole(dto, {
      next: (role: RoleResponseDto): void => {
        this.creating.set(false);
        this.showCreateForm.set(false);
        this.notificationService.show({
          message: 'Role created successfully.',
          type: 'success',
        });
        this.assignAutoAssignPermissions(role._id);
      },
      error: (message: string): void => {
        this.creating.set(false);
        this.notificationService.show({ message, type: 'error' });
      },
    });
  }

  /**
   * Grants a new role its auto-assign permission set (full access to the
   * payment-gateway/messaging services, plus a curated least-privilege slice
   * of user-management), on top of whatever product-service permissions
   * the admin assigns manually in the drawer. Runs silently in the
   * background — only a failure surfaces a toast, since the role itself
   * already exists and was already confirmed successful.
   *
   * Waits on `PermissionsStore.permissionsLoaded()` rather than reading
   * `permissions()` synchronously, since the catalog may still be loading
   * at the exact moment a role is created; the effect destroys itself once
   * the one-time assignment work runs so it doesn't re-fire on later
   * unrelated store changes. Runs outside the constructor, so it needs an
   * explicit `injector` to satisfy `effect()`'s injection-context check.
   */
  private assignAutoAssignPermissions(roleId: string): void {
    const ref: EffectRef = effect(
      (): void => {
        if (this.permissionsStore.permissionsError()) {
          ref.destroy();
          this.notificationService.show({
            message:
              "Role created, but default permissions couldn't be loaded to assign automatically.",
            type: 'error',
          });
          return;
        }
        if (!this.permissionsStore.permissionsLoaded()) {
          return;
        }

        const permissions: PermissionResponseDto[] =
          selectAutoAssignPermissions(this.permissionsStore.permissions());

        let hasReportedFailure: boolean = false;
        permissions.forEach((permission: PermissionResponseDto): void => {
          this.rolePermissionsStore.createRolePermission(
            { roleId, permissionId: permission._id },
            {
              // No per-permission success feedback — this runs silently in
              // the background, only a failure needs to surface a toast.
              next: (): void => undefined,
              error: (): void => {
                if (!hasReportedFailure) {
                  hasReportedFailure = true;
                  this.notificationService.show({
                    message:
                      "Role created, but some default permissions couldn't be assigned automatically.",
                    type: 'error',
                  });
                }
              },
            },
          );
        });

        ref.destroy();
      },
      { injector: this.injector },
    );
  }

  protected toggleMenu(roleId: string): void {
    this.openMenuId.update((current: string | null) =>
      current === roleId ? null : roleId,
    );
  }

  protected closeMenu(): void {
    this.openMenuId.set(null);
  }
}
