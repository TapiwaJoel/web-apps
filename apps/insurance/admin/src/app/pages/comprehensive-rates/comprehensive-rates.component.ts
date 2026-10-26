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
  ComprehensiveRateResponseDto,
  ComprehensiveRatesStore,
  CreateComprehensiveRateDto,
  EntityStatus,
  VehicleTypeResponseDto,
  VehicleTypesStore,
  VehicleUsageResponseDto,
  VehicleUsagesStore,
} from '@mushaviri/api';
import {
  ColumnFilter,
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
  ENTITY_STATUS_TONES,
} from '@mushaviri/ui';
import { CreateComprehensiveRateDialogComponent } from './create-comprehensive-rate-dialog/create-comprehensive-rate-dialog.component';
import { ComprehensiveRateDetailDrawerComponent } from './comprehensive-rate-detail-drawer/comprehensive-rate-detail-drawer.component';
import { ComprehensiveRateRow } from '../../shared/types/comprehensive-rates/comprehensive-rate-row.type';
import { ComprehensiveRateColumnKey } from '../../shared/types/comprehensive-rates/comprehensive-rate-column-key.type';
import { ComprehensiveRateFilters } from '../../shared/types/comprehensive-rates/comprehensive-rate-filters.type';
import { INITIAL_COMPREHENSIVE_RATE_FILTERS } from '../../shared/types/comprehensive-rates/initial-comprehensive-rate-filters.const';

const DEFAULT_PAGE_SIZE: number = 10;

@Component({
  selector: 'org-comprehensive-rates',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    RouterLink,
    OverlayModule,
    CreateComprehensiveRateDialogComponent,
    KpiStatCardComponent,
    SortableColumnHeaderComponent,
    TablePaginationComponent,
    ComprehensiveRateDetailDrawerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './comprehensive-rates.component.html',
})
export class ComprehensiveRatesComponent {
  protected readonly EntityStatus: typeof EntityStatus = EntityStatus;

  private readonly store: InstanceType<typeof ComprehensiveRatesStore> = inject(
    ComprehensiveRatesStore,
  );
  private readonly vehicleTypesStore: InstanceType<typeof VehicleTypesStore> =
    inject(VehicleTypesStore);
  private readonly vehicleUsagesStore: InstanceType<typeof VehicleUsagesStore> =
    inject(VehicleUsagesStore);
  private readonly notificationService: NotificationService =
    inject(NotificationService);
  private readonly globalSearch: GlobalSearchService =
    inject(GlobalSearchService);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);

  protected readonly selectedComprehensiveRateId: Signal<string | null> =
    toSignal(
      this.route.paramMap.pipe(map((params: ParamMap) => params.get('id'))),
      { initialValue: null },
    );

  protected readonly comprehensiveRates: Signal<
    ComprehensiveRateResponseDto[]
  > = this.store.comprehensiveRates;
  protected readonly comprehensiveRatesLoading: Signal<boolean> =
    this.store.comprehensiveRatesLoading;
  protected readonly comprehensiveRatesError: Signal<string | null> =
    this.store.comprehensiveRatesError;
  protected readonly vehicleTypes: Signal<VehicleTypeResponseDto[]> =
    this.vehicleTypesStore.vehicleTypes;
  protected readonly vehicleUsages: Signal<VehicleUsageResponseDto[]> =
    this.vehicleUsagesStore.vehicleUsages;

  protected readonly showDialog: WritableSignal<boolean> = signal(false);
  protected readonly saving: WritableSignal<boolean> = signal(false);
  protected readonly openMenuId: WritableSignal<string | null> = signal(null);

  protected readonly filters: WritableSignal<ComprehensiveRateFilters> = signal(
    {
      ...INITIAL_COMPREHENSIVE_RATE_FILTERS,
    },
  );
  protected readonly filtersOpen: WritableSignal<boolean> = signal(false);
  protected readonly sortKey: WritableSignal<ComprehensiveRateColumnKey | null> =
    signal(null);
  protected readonly sortDirection: WritableSignal<SortDirection> =
    signal(null);
  protected readonly page: WritableSignal<number> = signal(1);
  protected readonly pageSize: WritableSignal<number> =
    signal(DEFAULT_PAGE_SIZE);

  private readonly vehicleTypeNamesById: Signal<Map<string, string>> = computed<
    Map<string, string>
  >(
    () =>
      new Map(
        this.vehicleTypes().map((vehicleType: VehicleTypeResponseDto) => [
          vehicleType._id,
          vehicleType.name,
        ]),
      ),
  );

  private readonly vehicleUsageLabelsById: Signal<Map<string, string>> =
    computed<Map<string, string>>(
      () =>
        new Map(
          this.vehicleUsages().map((vehicleUsage: VehicleUsageResponseDto) => [
            vehicleUsage._id,
            vehicleUsage.usages.join(', '),
          ]),
        ),
    );

  protected readonly rows: Signal<ComprehensiveRateRow[]> = computed<
    ComprehensiveRateRow[]
  >(() =>
    this.comprehensiveRates().map(
      (
        comprehensiveRate: ComprehensiveRateResponseDto,
      ): ComprehensiveRateRow => ({
        ...comprehensiveRate,
        statusTone: ENTITY_STATUS_TONES[comprehensiveRate.status] ?? 'info',
        vehicleTypeName:
          this.vehicleTypeNamesById().get(comprehensiveRate.vehicleType) ??
          comprehensiveRate.vehicleType,
        vehicleUsageLabel:
          this.vehicleUsageLabelsById().get(comprehensiveRate.vehicleUsage) ??
          comprehensiveRate.vehicleUsage,
      }),
    ),
  );

  protected readonly comprehensiveRateStats: Signal<KpiCard[]> = computed<
    KpiCard[]
  >(() => {
    const all: ComprehensiveRateRow[] = this.rows();
    const active: ComprehensiveRateRow[] = all.filter(
      (comprehensiveRate: ComprehensiveRateRow) =>
        comprehensiveRate.status === EntityStatus.ACTIVE,
    );
    const averageRate: number =
      all.length === 0
        ? 0
        : all.reduce(
            (sum: number, comprehensiveRate: ComprehensiveRateRow) =>
              sum + comprehensiveRate.rate,
            0,
          ) / all.length;
    return [
      {
        label: 'Total Rates',
        value: String(all.length),
        icon: 'fi fi-rr-percentage',
      },
      {
        label: 'Active',
        value: String(active.length),
        icon: 'fi fi-rr-check-circle',
      },
      {
        label: 'Avg. Rate',
        value: `${averageRate.toFixed(averageRate % 1 === 0 ? 1 : 2)}%`,
        icon: 'fi fi-rr-calculator',
      },
    ];
  });

  protected readonly statusOptions: Signal<string[]> = computed<string[]>(() =>
    Array.from(
      new Set(
        this.rows().map(
          (comprehensiveRate: ComprehensiveRateRow): string =>
            comprehensiveRate.status,
        ),
      ),
    ),
  );

  protected readonly vehicleTypeOptions: Signal<string[]> = computed<string[]>(
    () =>
      Array.from(
        new Set(
          this.rows().map(
            (comprehensiveRate: ComprehensiveRateRow): string =>
              comprehensiveRate.vehicleTypeName,
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

  private readonly columnFilters: Signal<ColumnFilter<ComprehensiveRateRow>[]> =
    computed<ColumnFilter<ComprehensiveRateRow>[]>(() => {
      const current: ComprehensiveRateFilters = this.filters();
      return [
        {
          accessor: (comprehensiveRate: ComprehensiveRateRow): string =>
            comprehensiveRate.vehicleTypeName,
          predicate: equalsPredicate,
          value: current.vehicleType,
        },
        {
          accessor: (comprehensiveRate: ComprehensiveRateRow): string =>
            comprehensiveRate.status,
          predicate: equalsPredicate,
          value: current.status,
        },
        {
          accessor: (comprehensiveRate: ComprehensiveRateRow): Date =>
            new Date(comprehensiveRate.createdAt),
          predicate: dateRangePredicate,
          value: { from: current.createdFrom, to: current.createdTo },
        },
      ];
    });

  protected readonly filteredRows: Signal<ComprehensiveRateRow[]> = computed<
    ComprehensiveRateRow[]
  >(() => {
    const filtered: ComprehensiveRateRow[] = filterRows(
      this.rows(),
      this.columnFilters(),
    );
    return searchRows(filtered, this.globalSearch.query(), [
      (comprehensiveRate: ComprehensiveRateRow): string =>
        comprehensiveRate.vehicleTypeName,
      (comprehensiveRate: ComprehensiveRateRow): string =>
        comprehensiveRate.vehicleUsageLabel,
      (comprehensiveRate: ComprehensiveRateRow): string =>
        comprehensiveRate.status,
    ]);
  });

  protected readonly filteredTotal: Signal<number> = computed<number>(
    () => this.filteredRows().length,
  );

  private readonly sortedRows: Signal<ComprehensiveRateRow[]> = computed<
    ComprehensiveRateRow[]
  >(() => {
    const key: ComprehensiveRateColumnKey | null = this.sortKey();
    const accessor:
      ((comprehensiveRate: ComprehensiveRateRow) => unknown) | null = key
      ? (comprehensiveRate: ComprehensiveRateRow): unknown =>
          key === 'createdAt'
            ? new Date(comprehensiveRate.createdAt)
            : comprehensiveRate[key]
      : null;
    return sortRows(this.filteredRows(), accessor, this.sortDirection());
  });

  protected readonly pagedRows: Signal<ComprehensiveRateRow[]> = computed<
    ComprehensiveRateRow[]
  >(() => paginateRows(this.sortedRows(), this.page(), this.pageSize()));

  public constructor() {
    this.store.loadComprehensiveRates();
    this.vehicleTypesStore.loadVehicleTypes();
    this.vehicleUsagesStore.loadVehicleUsages();

    this.globalSearch.placeholder.set('Search comprehensive rates…');
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

  protected submitDialog(dto: CreateComprehensiveRateDto): void {
    this.saving.set(true);

    this.store.createComprehensiveRate(dto, {
      next: (): void => {
        this.saving.set(false);
        this.showDialog.set(false);
        this.notificationService.show({
          message: 'Comprehensive rate created successfully.',
          type: 'success',
        });
      },
      error: (message: string): void => {
        this.saving.set(false);
        this.notificationService.show({ message, type: 'error' });
      },
    });
  }

  protected onFilterChange<K extends keyof ComprehensiveRateFilters>(
    key: K,
    value: ComprehensiveRateFilters[K],
  ): void {
    this.filters.update(
      (current: ComprehensiveRateFilters): ComprehensiveRateFilters => ({
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
    this.filters.set({ ...INITIAL_COMPREHENSIVE_RATE_FILTERS });
    this.page.set(1);
  }

  protected onSortChange(
    key: ComprehensiveRateColumnKey,
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
