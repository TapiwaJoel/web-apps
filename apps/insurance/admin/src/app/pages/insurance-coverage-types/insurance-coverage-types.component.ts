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
  CreateInsuranceCoverageTypeDto,
  EntityStatus,
  InsuranceCompaniesStore,
  InsuranceCompanyResponseDto,
  InsuranceCoverageTypeResponseDto,
  InsuranceCoverageTypesStore,
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
  KpiStatCardComponent,
  KpiCard,
} from '@mushaviri/ui';
import { CreateInsuranceCoverageTypeDialogComponent } from './create-insurance-coverage-type-dialog/create-insurance-coverage-type-dialog.component';
import { InsuranceCoverageTypeDetailDrawerComponent } from './insurance-coverage-type-detail-drawer/insurance-coverage-type-detail-drawer.component';
import { STATUS_TONES } from '../../shared/types/insurance-coverage-types/status-tones.const';
import { InsuranceCoverageTypeRow } from '../../shared/types/insurance-coverage-types/insurance-coverage-type-row.type';
import { InsuranceCoverageTypeColumnKey } from '../../shared/types/insurance-coverage-types/insurance-coverage-type-column-key.type';
import { InsuranceCoverageTypeFilters } from '../../shared/types/insurance-coverage-types/insurance-coverage-type-filters.type';
import { INITIAL_INSURANCE_COVERAGE_TYPE_FILTERS } from '../../shared/types/insurance-coverage-types/initial-insurance-coverage-type-filters.const';

const DEFAULT_PAGE_SIZE: number = 10;

@Component({
  selector: 'org-insurance-coverage-types',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    RouterLink,
    OverlayModule,
    CreateInsuranceCoverageTypeDialogComponent,
    KpiStatCardComponent,
    SortableColumnHeaderComponent,
    TablePaginationComponent,
    InsuranceCoverageTypeDetailDrawerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './insurance-coverage-types.component.html',
})
export class InsuranceCoverageTypesComponent {
  protected readonly EntityStatus: typeof EntityStatus = EntityStatus;

  private readonly store: InstanceType<typeof InsuranceCoverageTypesStore> =
    inject(InsuranceCoverageTypesStore);
  private readonly insuranceCompaniesStore: InstanceType<
    typeof InsuranceCompaniesStore
  > = inject(InsuranceCompaniesStore);
  private readonly usersStore: InstanceType<typeof UsersStore> =
    inject(UsersStore);
  private readonly notificationService: NotificationService =
    inject(NotificationService);
  private readonly globalSearch: GlobalSearchService =
    inject(GlobalSearchService);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);

  protected readonly selectedInsuranceCoverageTypeId: Signal<string | null> =
    toSignal(
      this.route.paramMap.pipe(map((params: ParamMap) => params.get('id'))),
      { initialValue: null },
    );

  protected readonly insuranceCoverageTypes: Signal<
    InsuranceCoverageTypeResponseDto[]
  > = this.store.insuranceCoverageTypes;
  protected readonly insuranceCoverageTypesLoading: Signal<boolean> =
    this.store.insuranceCoverageTypesLoading;
  protected readonly insuranceCoverageTypesError: Signal<string | null> =
    this.store.insuranceCoverageTypesError;
  protected readonly insuranceCompanies: Signal<InsuranceCompanyResponseDto[]> =
    this.insuranceCompaniesStore.insuranceCompanies;

  protected readonly showDialog: WritableSignal<boolean> = signal(false);
  protected readonly saving: WritableSignal<boolean> = signal(false);
  protected readonly openMenuId: WritableSignal<string | null> = signal(null);

  protected readonly filters: WritableSignal<InsuranceCoverageTypeFilters> =
    signal({ ...INITIAL_INSURANCE_COVERAGE_TYPE_FILTERS });
  protected readonly filtersOpen: WritableSignal<boolean> = signal(false);
  protected readonly sortKey: WritableSignal<InsuranceCoverageTypeColumnKey | null> =
    signal(null);
  protected readonly sortDirection: WritableSignal<SortDirection> =
    signal(null);
  protected readonly page: WritableSignal<number> = signal(1);
  protected readonly pageSize: WritableSignal<number> =
    signal(DEFAULT_PAGE_SIZE);

  /**
   * Two-hop resolution: insuranceCompany id -> InsuranceCompanyResponseDto
   * -> systemUserId -> SystemUserResponseDto.name, built once as a Map keyed
   * by InsuranceCompanyResponseDto._id so the rest of the component only
   * needs a single lookup.
   */
  protected readonly insuranceCompanyLabelById: Signal<Map<string, string>> =
    computed<Map<string, string>>(() => {
      const userNamesById: Map<string, string> = new Map(
        this.usersStore
          .users()
          .map((user: SystemUserResponseDto) => [user._id, user.name]),
      );
      return new Map(
        this.insuranceCompanies().map(
          (insuranceCompany: InsuranceCompanyResponseDto) => [
            insuranceCompany._id,
            userNamesById.get(insuranceCompany.systemUserId) ??
              insuranceCompany._id,
          ],
        ),
      );
    });

  protected readonly insuranceCompanyOptions: Signal<
    { id: string; label: string }[]
  > = computed<{ id: string; label: string }[]>(() => {
    const labelById: Map<string, string> = this.insuranceCompanyLabelById();
    return this.insuranceCompanies().map(
      (insuranceCompany: InsuranceCompanyResponseDto) => ({
        id: insuranceCompany._id,
        label: labelById.get(insuranceCompany._id) ?? insuranceCompany._id,
      }),
    );
  });

  protected readonly rows: Signal<InsuranceCoverageTypeRow[]> = computed<
    InsuranceCoverageTypeRow[]
  >(() =>
    this.insuranceCoverageTypes().map(
      (
        insuranceCoverageType: InsuranceCoverageTypeResponseDto,
      ): InsuranceCoverageTypeRow => ({
        ...insuranceCoverageType,
        statusTone: STATUS_TONES[insuranceCoverageType.status] ?? 'info',
        insuranceCompanyLabel:
          this.insuranceCompanyLabelById().get(
            insuranceCoverageType.insuranceCompany,
          ) ?? insuranceCoverageType.insuranceCompany,
      }),
    ),
  );

  protected readonly insuranceCoverageTypeStats: Signal<KpiCard[]> = computed<
    KpiCard[]
  >(() => {
    const all: InsuranceCoverageTypeRow[] = this.rows();
    return [
      {
        label: 'Total Coverage Types',
        value: String(all.length),
        icon: 'fi fi-rr-shield-check',
      },
      {
        label: 'Active',
        value: String(
          all.filter(
            (insuranceCoverageType: InsuranceCoverageTypeRow) =>
              insuranceCoverageType.status === EntityStatus.ACTIVE,
          ).length,
        ),
        icon: 'fi fi-rr-check-circle',
      },
      {
        label: 'Companies Covered',
        value: String(
          new Set(
            all.map(
              (insuranceCoverageType: InsuranceCoverageTypeRow) =>
                insuranceCoverageType.insuranceCompany,
            ),
          ).size,
        ),
        icon: 'fi fi-rr-building',
      },
    ];
  });

  protected readonly statusOptions: Signal<string[]> = computed<string[]>(() =>
    Array.from(
      new Set(
        this.rows().map(
          (insuranceCoverageType: InsuranceCoverageTypeRow): string =>
            insuranceCoverageType.status,
        ),
      ),
    ),
  );

  protected readonly insuranceCompanyLabelOptions: Signal<string[]> = computed<
    string[]
  >(() =>
    Array.from(
      new Set(
        this.rows().map(
          (insuranceCoverageType: InsuranceCoverageTypeRow): string =>
            insuranceCoverageType.insuranceCompanyLabel,
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

  private readonly columnFilters: Signal<
    ColumnFilter<InsuranceCoverageTypeRow>[]
  > = computed<ColumnFilter<InsuranceCoverageTypeRow>[]>(() => {
    const current: InsuranceCoverageTypeFilters = this.filters();
    return [
      {
        accessor: (insuranceCoverageType: InsuranceCoverageTypeRow): string =>
          insuranceCoverageType.name,
        predicate: containsPredicate,
        value: current.name,
      },
      {
        accessor: (insuranceCoverageType: InsuranceCoverageTypeRow): string =>
          insuranceCoverageType.insuranceCompanyLabel,
        predicate: equalsPredicate,
        value: current.insuranceCompany,
      },
      {
        accessor: (insuranceCoverageType: InsuranceCoverageTypeRow): string =>
          insuranceCoverageType.status,
        predicate: equalsPredicate,
        value: current.status,
      },
      {
        accessor: (insuranceCoverageType: InsuranceCoverageTypeRow): Date =>
          new Date(insuranceCoverageType.createdAt),
        predicate: dateRangePredicate,
        value: { from: current.createdFrom, to: current.createdTo },
      },
    ];
  });

  protected readonly filteredRows: Signal<InsuranceCoverageTypeRow[]> =
    computed<InsuranceCoverageTypeRow[]>(() => {
      const filtered: InsuranceCoverageTypeRow[] = filterRows(
        this.rows(),
        this.columnFilters(),
      );
      return searchRows(filtered, this.globalSearch.query(), [
        (insuranceCoverageType: InsuranceCoverageTypeRow): string =>
          insuranceCoverageType.name,
        (insuranceCoverageType: InsuranceCoverageTypeRow): string =>
          insuranceCoverageType.insuranceCompanyLabel,
        (insuranceCoverageType: InsuranceCoverageTypeRow): string =>
          insuranceCoverageType.description ?? '',
        (insuranceCoverageType: InsuranceCoverageTypeRow): string =>
          insuranceCoverageType.status,
      ]);
    });

  protected readonly filteredTotal: Signal<number> = computed<number>(
    () => this.filteredRows().length,
  );

  private readonly sortedRows: Signal<InsuranceCoverageTypeRow[]> = computed<
    InsuranceCoverageTypeRow[]
  >(() => {
    const key: InsuranceCoverageTypeColumnKey | null = this.sortKey();
    const accessor:
      ((insuranceCoverageType: InsuranceCoverageTypeRow) => unknown) | null =
      key
        ? (insuranceCoverageType: InsuranceCoverageTypeRow): unknown =>
            key === 'createdAt'
              ? new Date(insuranceCoverageType.createdAt)
              : insuranceCoverageType[key]
        : null;
    return sortRows(this.filteredRows(), accessor, this.sortDirection());
  });

  protected readonly pagedRows: Signal<InsuranceCoverageTypeRow[]> = computed<
    InsuranceCoverageTypeRow[]
  >(() => paginateRows(this.sortedRows(), this.page(), this.pageSize()));

  public constructor() {
    this.store.loadInsuranceCoverageTypes();
    this.insuranceCompaniesStore.loadInsuranceCompanies();
    this.usersStore.loadUsers({ serviceName: INSURANCE_PATH });

    this.globalSearch.placeholder.set('Search insurance coverage types…');
    inject(DestroyRef).onDestroy((): void => {
      this.globalSearch.placeholder.set('Search...');
      this.globalSearch.query.set('');
    });

    effect((): void => {
      this.globalSearch.query();
      this.page.set(1);
    });
  }

  protected openCreateForm(): void {
    this.showDialog.set(true);
  }

  protected cancelDialog(): void {
    this.showDialog.set(false);
  }

  protected submitDialog(dto: CreateInsuranceCoverageTypeDto): void {
    this.saving.set(true);

    this.store.createInsuranceCoverageType(dto, {
      next: (): void => {
        this.saving.set(false);
        this.showDialog.set(false);
        this.notificationService.show({
          message: 'Insurance coverage type created successfully.',
          type: 'success',
        });
      },
      error: (message: string): void => {
        this.saving.set(false);
        this.notificationService.show({ message, type: 'error' });
      },
    });
  }

  protected onFilterChange<K extends keyof InsuranceCoverageTypeFilters>(
    key: K,
    value: InsuranceCoverageTypeFilters[K],
  ): void {
    this.filters.update(
      (
        current: InsuranceCoverageTypeFilters,
      ): InsuranceCoverageTypeFilters => ({
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
    this.filters.set({ ...INITIAL_INSURANCE_COVERAGE_TYPE_FILTERS });
    this.page.set(1);
  }

  protected onSortChange(
    key: InsuranceCoverageTypeColumnKey,
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

  protected toggleMenu(id: string): void {
    this.openMenuId.update((current: string | null) =>
      current === id ? null : id,
    );
  }

  protected closeMenu(): void {
    this.openMenuId.set(null);
  }
}
