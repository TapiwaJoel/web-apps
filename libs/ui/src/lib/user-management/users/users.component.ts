import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
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
  CreateSystemUserDto,
  RoleResponseDto,
  RolesStore,
  SystemUserResponseDto,
  UserStatus,
  UsersStore,
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
import { CreateUserDialogComponent } from './create-user-dialog/create-user-dialog.component';
import { UserDetailDrawerComponent } from './user-detail-drawer/user-detail-drawer.component';
import { KpiStatCardComponent } from '../../kpi-stat-card/kpi-stat-card.component';
import { KpiCard } from '../../kpi-stat-card/kpi-card.type';
import { USER_STATUS_TONES } from '../types/user-status-tones.const';
import { SystemUserRow } from '../types/system-user-row.type';
import { UserColumnKey } from '../types/user-column-key.type';
import { UserFilters } from '../types/user-filters.type';
import { INITIAL_USER_FILTERS } from '../types/initial-user-filters.const';

const DEFAULT_PAGE_SIZE: number = 10;

@Component({
  selector: 'org-users',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    RouterLink,
    OverlayModule,
    CreateUserDialogComponent,
    KpiStatCardComponent,
    SortableColumnHeaderComponent,
    TablePaginationComponent,
    UserDetailDrawerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './users.component.html',
})
export class UsersComponent {
  protected readonly UserStatus: typeof UserStatus = UserStatus;

  private readonly store: InstanceType<typeof UsersStore> = inject(UsersStore);
  private readonly rolesStore: InstanceType<typeof RolesStore> =
    inject(RolesStore);
  private readonly notificationService: NotificationService =
    inject(NotificationService);
  private readonly globalSearch: GlobalSearchService =
    inject(GlobalSearchService);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly serviceName: string = inject(ADMIN_SERVICE_NAME);

  protected readonly selectedUserId: Signal<string | null> = toSignal(
    this.route.paramMap.pipe(map((params: ParamMap) => params.get('id'))),
    { initialValue: null },
  );

  protected readonly users: Signal<SystemUserResponseDto[]> = this.store.users;
  protected readonly usersLoading: Signal<boolean> = this.store.usersLoading;
  protected readonly usersError: Signal<string | null> = this.store.usersError;
  protected readonly roles: Signal<RoleResponseDto[]> = this.rolesStore.roles;

  protected readonly showDialog: WritableSignal<boolean> = signal(false);
  protected readonly saving: WritableSignal<boolean> = signal(false);
  protected readonly openMenuId: WritableSignal<string | null> = signal(null);

  protected readonly filters: WritableSignal<UserFilters> = signal({
    ...INITIAL_USER_FILTERS,
  });
  protected readonly filtersOpen: WritableSignal<boolean> = signal(false);
  protected readonly sortKey: WritableSignal<UserColumnKey | null> =
    signal(null);
  protected readonly sortDirection: WritableSignal<SortDirection> =
    signal(null);
  protected readonly page: WritableSignal<number> = signal(1);
  protected readonly pageSize: WritableSignal<number> =
    signal(DEFAULT_PAGE_SIZE);

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
        statusTone: USER_STATUS_TONES[user.status] ?? 'info',
        roleName: this.roleNamesById().get(user.role) ?? user.role,
      })),
  );

  protected readonly userStats: Signal<KpiCard[]> = computed<KpiCard[]>(() => {
    const all: SystemUserRow[] = this.rows();
    const thirtyDaysAgo: Date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return [
      {
        label: 'Total Users',
        value: String(all.length),
        icon: 'fi fi-rr-users',
      },
      {
        label: 'Active',
        value: String(
          all.filter((user: SystemUserRow) => user.status === UserStatus.ACTIVE)
            .length,
        ),
        icon: 'fi fi-rr-check-circle',
      },
      {
        label: 'Roles Assigned',
        value: String(
          new Set(all.map((user: SystemUserRow) => user.role)).size,
        ),
        icon: 'fi fi-rr-shield',
      },
      {
        label: 'New (30d)',
        value: String(
          all.filter(
            (user: SystemUserRow) => new Date(user.createdAt) >= thirtyDaysAgo,
          ).length,
        ),
        icon: 'fi fi-rr-user-add',
      },
    ];
  });

  protected readonly statusOptions: Signal<string[]> = computed<string[]>(() =>
    Array.from(
      new Set(this.rows().map((user: SystemUserRow): string => user.status)),
    ),
  );

  protected readonly roleOptions: Signal<string[]> = computed<string[]>(() =>
    Array.from(
      new Set(this.rows().map((user: SystemUserRow): string => user.roleName)),
    ),
  );

  protected readonly activeFilterCount: Signal<number> = computed<number>(
    () =>
      Object.values(this.filters()).filter(
        (value: string | null): boolean => value !== '' && value !== null,
      ).length,
  );

  private readonly columnFilters: Signal<ColumnFilter<SystemUserRow>[]> =
    computed<ColumnFilter<SystemUserRow>[]>(() => {
      const current: UserFilters = this.filters();
      return [
        {
          accessor: (user: SystemUserRow): string => user.name,
          predicate: containsPredicate,
          value: current.name,
        },
        {
          accessor: (user: SystemUserRow): string => user.emailAddress ?? '',
          predicate: containsPredicate,
          value: current.emailAddress,
        },
        {
          accessor: (user: SystemUserRow): string => user.phoneNumber,
          predicate: containsPredicate,
          value: current.phoneNumber,
        },
        {
          accessor: (user: SystemUserRow): string => user.roleName,
          predicate: equalsPredicate,
          value: current.roleName,
        },
        {
          accessor: (user: SystemUserRow): string => user.status,
          predicate: equalsPredicate,
          value: current.status,
        },
        {
          accessor: (user: SystemUserRow): Date => new Date(user.createdAt),
          predicate: dateRangePredicate,
          value: { from: current.createdFrom, to: current.createdTo },
        },
      ];
    });

  protected readonly filteredRows: Signal<SystemUserRow[]> = computed<
    SystemUserRow[]
  >(() => {
    const filtered: SystemUserRow[] = filterRows(
      this.rows(),
      this.columnFilters(),
    );
    return searchRows(filtered, this.globalSearch.query(), [
      (user: SystemUserRow): string => user.name,
      (user: SystemUserRow): string => user.emailAddress ?? '',
      (user: SystemUserRow): string => user.phoneNumber,
      (user: SystemUserRow): string => user.roleName,
      (user: SystemUserRow): string => user.status,
    ]);
  });

  protected readonly filteredTotal: Signal<number> = computed<number>(
    () => this.filteredRows().length,
  );

  private readonly sortedRows: Signal<SystemUserRow[]> = computed<
    SystemUserRow[]
  >(() => {
    const key: UserColumnKey | null = this.sortKey();
    const accessor: ((user: SystemUserRow) => unknown) | null = key
      ? (user: SystemUserRow): unknown =>
          key === 'createdAt' ? new Date(user.createdAt) : user[key]
      : null;
    return sortRows(this.filteredRows(), accessor, this.sortDirection());
  });

  protected readonly pagedRows: Signal<SystemUserRow[]> = computed<
    SystemUserRow[]
  >(() => paginateRows(this.sortedRows(), this.page(), this.pageSize()));

  public constructor() {
    this.store.loadUsers({ serviceName: this.serviceName });
    this.rolesStore.loadRoles({ serviceName: this.serviceName });

    this.globalSearch.placeholder.set('Search users…');
    inject(DestroyRef).onDestroy((): void => {
      this.globalSearch.placeholder.set('Search...');
      this.globalSearch.query.set('');
    });

    effect((): void => {
      this.globalSearch.query();
      this.page.set(1);
    });

    effect((): void => {
      const knownRoleIds: Set<string> = new Set(
        this.roles().map((role: RoleResponseDto) => role._id),
      );
      this.users().forEach((user: SystemUserResponseDto): void => {
        if (!knownRoleIds.has(user.role)) {
          this.rolesStore.loadRoles({ _id: user.role });
        }
      });
    });
  }

  protected openCreateForm(): void {
    this.showDialog.set(true);
  }

  protected cancelDialog(): void {
    this.showDialog.set(false);
  }

  protected submitDialog(dto: CreateSystemUserDto): void {
    this.saving.set(true);

    this.store.createUser(dto, {
      next: (): void => {
        this.saving.set(false);
        this.showDialog.set(false);
        this.notificationService.show({
          message: 'User created successfully.',
          type: 'success',
        });
      },
      error: (message: string): void => {
        this.saving.set(false);
        this.notificationService.show({ message, type: 'error' });
      },
    });
  }

  protected onFilterChange<K extends keyof UserFilters>(
    key: K,
    value: UserFilters[K],
  ): void {
    this.filters.update((current: UserFilters): UserFilters => ({
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
    this.filters.set({ ...INITIAL_USER_FILTERS });
    this.page.set(1);
  }

  protected onSortChange(key: UserColumnKey, direction: SortDirection): void {
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

  protected toggleMenu(id: string): void {
    this.openMenuId.update((current: string | null) =>
      current === id ? null : id,
    );
  }

  protected closeMenu(): void {
    this.openMenuId.set(null);
  }
}
