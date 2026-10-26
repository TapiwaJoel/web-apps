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
  CreateInsuranceCompanyDto,
  EntityStatus,
  InsuranceCompaniesStore,
  InsuranceCompanyResponseDto,
  SystemUserResponseDto,
  UsersStore,
  INSURANCE_PATH,
} from '@mushaviri/api';
import {
  ColumnFilter,
  containsPredicate,
  dateRangePredicate,
  equalsPredicate,
  filterRows,
  GlobalSearchService,
  paginateRows,
  searchRows,
  sortRows,
  SortDirection,
} from '@mushaviri/util';
import {
  NotificationService,
  SortableColumnHeaderComponent,
  TablePaginationComponent,
  StatusPillComponent,
  KpiStatCardComponent,
  KpiCard,
  ENTITY_STATUS_TONES,
} from '@mushaviri/ui';
import { CreateInsuranceCompanyDialogComponent } from './create-insurance-company-dialog/create-insurance-company-dialog.component';
import { InsuranceCompanyDetailDrawerComponent } from './insurance-company-detail-drawer/insurance-company-detail-drawer.component';
import { INITIAL_INSURANCE_COMPANY_FILTERS } from '../../shared/types/insurance-companies/initial-insurance-company-filters.const';
import { InsuranceCompanyColumnKey } from '../../shared/types/insurance-companies/insurance-company-column-key.type';
import { InsuranceCompanyFilters } from '../../shared/types/insurance-companies/insurance-company-filters.type';
import { InsuranceCompanyRow } from '../../shared/types/insurance-companies/insurance-company-row.type';

const DEFAULT_PAGE_SIZE: number = 10;

@Component({
  selector: 'org-insurance-companies',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    RouterLink,
    OverlayModule,
    CreateInsuranceCompanyDialogComponent,
    InsuranceCompanyDetailDrawerComponent,
    StatusPillComponent,
    TablePaginationComponent,
    SortableColumnHeaderComponent,
    KpiStatCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './insurance-companies.component.html',
})
export class InsuranceCompaniesComponent {
  protected readonly EntityStatus: typeof EntityStatus = EntityStatus;

  private readonly store: InstanceType<typeof InsuranceCompaniesStore> = inject(
    InsuranceCompaniesStore,
  );
  private readonly usersStore: InstanceType<typeof UsersStore> =
    inject(UsersStore);
  private readonly notificationService: NotificationService =
    inject(NotificationService);
  private readonly globalSearch: GlobalSearchService =
    inject(GlobalSearchService);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);

  protected readonly selectedInsuranceCompanyId: Signal<string | null> =
    toSignal(
      this.route.paramMap.pipe(map((params: ParamMap) => params.get('id'))),
      { initialValue: null },
    );

  protected readonly insuranceCompaniesLoading: Signal<boolean> =
    this.store.insuranceCompaniesLoading;
  protected readonly insuranceCompaniesError: Signal<string | null> =
    this.store.insuranceCompaniesError;

  protected readonly users: Signal<SystemUserResponseDto[]> =
    this.usersStore.users;

  protected readonly showCreateForm: WritableSignal<boolean> = signal(false);
  protected readonly creating: WritableSignal<boolean> = signal(false);
  protected readonly openMenuId: WritableSignal<string | null> = signal(null);

  protected readonly filters: WritableSignal<InsuranceCompanyFilters> = signal({
    ...INITIAL_INSURANCE_COMPANY_FILTERS,
  });
  protected readonly filtersOpen: WritableSignal<boolean> = signal(false);
  protected readonly sortKey: WritableSignal<InsuranceCompanyColumnKey | null> =
    signal(null);
  protected readonly sortDirection: WritableSignal<SortDirection> =
    signal(null);
  protected readonly page: WritableSignal<number> = signal(1);
  protected readonly pageSize: WritableSignal<number> =
    signal(DEFAULT_PAGE_SIZE);

  protected readonly userNamesById: Signal<Map<string, string>> = computed(
    () =>
      new Map(
        this.usersStore
          .users()
          .map((user: SystemUserResponseDto): [string, string] => [
            user._id,
            user.name,
          ]),
      ),
  );

  protected readonly rows: Signal<InsuranceCompanyRow[]> = computed<
    InsuranceCompanyRow[]
  >(() => {
    const userNamesById: Map<string, string> = this.userNamesById();
    return this.store
      .insuranceCompanies()
      .map(
        (
          insuranceCompany: InsuranceCompanyResponseDto,
        ): InsuranceCompanyRow => ({
          ...insuranceCompany,
          userName:
            userNamesById.get(insuranceCompany.systemUserId) ??
            insuranceCompany.systemUserId,
          statusTone: ENTITY_STATUS_TONES[insuranceCompany.status] ?? 'info',
        }),
      );
  });

  protected readonly insuranceCompanyStats: Signal<KpiCard[]> = computed<
    KpiCard[]
  >(() => {
    const all: InsuranceCompanyRow[] = this.rows();
    const averageCommissionRate: number =
      all.length === 0
        ? 0
        : all.reduce(
            (total: number, insuranceCompany: InsuranceCompanyRow) =>
              total + insuranceCompany.commissionRate,
            0,
          ) / all.length;
    return [
      {
        label: 'Total Insurance Companies',
        value: String(all.length),
        icon: 'fi fi-rr-building',
      },
      {
        label: 'Active',
        value: String(
          all.filter(
            (insuranceCompany: InsuranceCompanyRow) =>
              insuranceCompany.status === EntityStatus.ACTIVE,
          ).length,
        ),
        icon: 'fi fi-rr-check-circle',
      },
      {
        label: 'Avg. Commission Rate',
        value: `${averageCommissionRate.toFixed(2)}%`,
        icon: 'fi fi-rr-percentage',
      },
    ];
  });

  protected readonly statusOptions: Signal<string[]> = computed<string[]>(() =>
    Array.from(
      new Set(
        this.rows().map(
          (insuranceCompany: InsuranceCompanyRow): string =>
            insuranceCompany.status,
        ),
      ),
    ),
  );

  protected readonly activeFilterCount: Signal<number> = computed<number>(
    () =>
      Object.values(this.filters()).filter(
        (value: string | null): boolean => value !== '' && value !== null,
      ).length,
  );

  private readonly columnFilters: Signal<ColumnFilter<InsuranceCompanyRow>[]> =
    computed<ColumnFilter<InsuranceCompanyRow>[]>(() => {
      const current: InsuranceCompanyFilters = this.filters();
      return [
        {
          accessor: (insuranceCompany: InsuranceCompanyRow): string =>
            insuranceCompany.userName,
          predicate: containsPredicate,
          value: current.userName,
        },
        {
          accessor: (insuranceCompany: InsuranceCompanyRow): string =>
            insuranceCompany.status,
          predicate: equalsPredicate,
          value: current.status,
        },
        {
          accessor: (insuranceCompany: InsuranceCompanyRow): Date =>
            new Date(insuranceCompany.createdAt),
          predicate: dateRangePredicate,
          value: { from: current.createdFrom, to: current.createdTo },
        },
      ];
    });

  protected readonly filteredRows: Signal<InsuranceCompanyRow[]> = computed<
    InsuranceCompanyRow[]
  >(() => {
    const filtered: InsuranceCompanyRow[] = filterRows(
      this.rows(),
      this.columnFilters(),
    );
    return searchRows(filtered, this.globalSearch.query(), [
      (insuranceCompany: InsuranceCompanyRow): string =>
        insuranceCompany.userName,
      (insuranceCompany: InsuranceCompanyRow): string =>
        insuranceCompany.status,
    ]);
  });

  protected readonly filteredTotal: Signal<number> = computed<number>(
    () => this.filteredRows().length,
  );

  private readonly sortedRows: Signal<InsuranceCompanyRow[]> = computed<
    InsuranceCompanyRow[]
  >(() => {
    const key: InsuranceCompanyColumnKey | null = this.sortKey();
    const accessor:
      ((insuranceCompany: InsuranceCompanyRow) => unknown) | null = key
      ? (insuranceCompany: InsuranceCompanyRow): unknown =>
          key === 'createdAt'
            ? new Date(insuranceCompany.createdAt)
            : insuranceCompany[key]
      : null;
    return sortRows(this.filteredRows(), accessor, this.sortDirection());
  });

  protected readonly pagedRows: Signal<InsuranceCompanyRow[]> = computed<
    InsuranceCompanyRow[]
  >(() => paginateRows(this.sortedRows(), this.page(), this.pageSize()));

  public constructor() {
    this.store.loadInsuranceCompanies();
    this.usersStore.loadUsers({ serviceName: INSURANCE_PATH });

    this.globalSearch.placeholder.set('Search insurance companies…');
    inject(DestroyRef).onDestroy((): void => {
      this.globalSearch.placeholder.set('Search...');
      this.globalSearch.query.set('');
    });

    effect((): void => {
      this.globalSearch.query();
      this.page.set(1);
    });
  }

  protected onFilterChange<K extends keyof InsuranceCompanyFilters>(
    key: K,
    value: InsuranceCompanyFilters[K],
  ): void {
    this.filters.update(
      (current: InsuranceCompanyFilters): InsuranceCompanyFilters => ({
        ...current,
        [key]: value,
      }),
    );
    this.page.set(1);
  }

  protected toggleFilters(): void {
    this.filtersOpen.update((open: boolean) => !open);
  }

  protected closeFilters(): void {
    this.filtersOpen.set(false);
  }

  protected resetFilters(): void {
    this.filters.set({ ...INITIAL_INSURANCE_COMPANY_FILTERS });
    this.page.set(1);
  }

  protected onSortChange(
    key: InsuranceCompanyColumnKey,
    direction: SortDirection,
  ): void {
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

  protected submitCreate(dto: CreateInsuranceCompanyDto): void {
    this.creating.set(true);

    this.store.createInsuranceCompany(dto, {
      next: (): void => {
        this.creating.set(false);
        this.showCreateForm.set(false);
        this.notificationService.show({
          message: 'Insurance company created successfully.',
          type: 'success',
        });
      },
      error: (message: string): void => {
        this.creating.set(false);
        this.notificationService.show({ message, type: 'error' });
      },
    });
  }

  protected toggleMenu(insuranceCompanyId: string): void {
    this.openMenuId.update((current: string | null) =>
      current === insuranceCompanyId ? null : insuranceCompanyId,
    );
  }

  protected closeMenu(): void {
    this.openMenuId.set(null);
  }
}
