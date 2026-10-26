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
  CreateVehicleUsageDto,
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
} from '@mushaviri/ui';
import { CreateVehicleUsageDialogComponent } from './create-vehicle-usage-dialog/create-vehicle-usage-dialog.component';
import { VehicleUsageDetailDrawerComponent } from './vehicle-usage-detail-drawer/vehicle-usage-detail-drawer.component';
import { STATUS_TONES } from '../../shared/types/vehicle-usages/status-tones.const';
import { VehicleUsageRow } from '../../shared/types/vehicle-usages/vehicle-usage-row.type';
import { VehicleUsageColumnKey } from '../../shared/types/vehicle-usages/vehicle-usage-column-key.type';
import { VehicleUsageFilters } from '../../shared/types/vehicle-usages/vehicle-usage-filters.type';
import { INITIAL_VEHICLE_USAGE_FILTERS } from '../../shared/types/vehicle-usages/initial-vehicle-usage-filters.const';

const DEFAULT_PAGE_SIZE: number = 10;

@Component({
  selector: 'org-vehicle-usages',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    RouterLink,
    OverlayModule,
    CreateVehicleUsageDialogComponent,
    KpiStatCardComponent,
    SortableColumnHeaderComponent,
    TablePaginationComponent,
    VehicleUsageDetailDrawerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './vehicle-usages.component.html',
})
export class VehicleUsagesComponent {
  protected readonly EntityStatus: typeof EntityStatus = EntityStatus;

  private readonly store: InstanceType<typeof VehicleUsagesStore> =
    inject(VehicleUsagesStore);
  private readonly vehicleTypesStore: InstanceType<typeof VehicleTypesStore> =
    inject(VehicleTypesStore);
  private readonly notificationService: NotificationService =
    inject(NotificationService);
  private readonly globalSearch: GlobalSearchService =
    inject(GlobalSearchService);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);

  protected readonly selectedVehicleUsageId: Signal<string | null> = toSignal(
    this.route.paramMap.pipe(map((params: ParamMap) => params.get('id'))),
    { initialValue: null },
  );

  protected readonly vehicleUsages: Signal<VehicleUsageResponseDto[]> =
    this.store.vehicleUsages;
  protected readonly vehicleUsagesLoading: Signal<boolean> =
    this.store.vehicleUsagesLoading;
  protected readonly vehicleUsagesError: Signal<string | null> =
    this.store.vehicleUsagesError;
  protected readonly vehicleTypes: Signal<VehicleTypeResponseDto[]> =
    this.vehicleTypesStore.vehicleTypes;

  protected readonly showDialog: WritableSignal<boolean> = signal(false);
  protected readonly saving: WritableSignal<boolean> = signal(false);
  protected readonly openMenuId: WritableSignal<string | null> = signal(null);

  protected readonly filters: WritableSignal<VehicleUsageFilters> = signal({
    ...INITIAL_VEHICLE_USAGE_FILTERS,
  });
  protected readonly filtersOpen: WritableSignal<boolean> = signal(false);
  protected readonly sortKey: WritableSignal<VehicleUsageColumnKey | null> =
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

  protected readonly rows: Signal<VehicleUsageRow[]> = computed<
    VehicleUsageRow[]
  >(() =>
    this.vehicleUsages().map(
      (vehicleUsage: VehicleUsageResponseDto): VehicleUsageRow => ({
        ...vehicleUsage,
        statusTone: STATUS_TONES[vehicleUsage.status] ?? 'info',
        vehicleTypeName:
          this.vehicleTypeNamesById().get(vehicleUsage.vehicleType) ??
          vehicleUsage.vehicleType,
      }),
    ),
  );

  protected readonly vehicleUsageStats: Signal<KpiCard[]> = computed<KpiCard[]>(
    () => {
      const all: VehicleUsageRow[] = this.rows();
      return [
        {
          label: 'Total Vehicle Usages',
          value: String(all.length),
          icon: 'fi fi-rr-car-side',
        },
        {
          label: 'Active',
          value: String(
            all.filter(
              (vehicleUsage: VehicleUsageRow) =>
                vehicleUsage.status === EntityStatus.ACTIVE,
            ).length,
          ),
          icon: 'fi fi-rr-check-circle',
        },
        {
          label: 'Vehicle Types Covered',
          value: String(
            new Set(
              all.map(
                (vehicleUsage: VehicleUsageRow) => vehicleUsage.vehicleType,
              ),
            ).size,
          ),
          icon: 'fi fi-rr-tags',
        },
      ];
    },
  );

  protected readonly statusOptions: Signal<string[]> = computed<string[]>(() =>
    Array.from(
      new Set(
        this.rows().map(
          (vehicleUsage: VehicleUsageRow): string => vehicleUsage.status,
        ),
      ),
    ),
  );

  protected readonly vehicleTypeOptions: Signal<string[]> = computed<string[]>(
    () =>
      Array.from(
        new Set(
          this.rows().map(
            (vehicleUsage: VehicleUsageRow): string =>
              vehicleUsage.vehicleTypeName,
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

  private readonly columnFilters: Signal<ColumnFilter<VehicleUsageRow>[]> =
    computed<ColumnFilter<VehicleUsageRow>[]>(() => {
      const current: VehicleUsageFilters = this.filters();
      return [
        {
          accessor: (vehicleUsage: VehicleUsageRow): string =>
            vehicleUsage.vehicleTypeName,
          predicate: equalsPredicate,
          value: current.vehicleType,
        },
        {
          accessor: (vehicleUsage: VehicleUsageRow): string =>
            vehicleUsage.status,
          predicate: equalsPredicate,
          value: current.status,
        },
        {
          accessor: (vehicleUsage: VehicleUsageRow): Date =>
            new Date(vehicleUsage.createdAt),
          predicate: dateRangePredicate,
          value: { from: current.createdFrom, to: current.createdTo },
        },
      ];
    });

  protected readonly filteredRows: Signal<VehicleUsageRow[]> = computed<
    VehicleUsageRow[]
  >(() => {
    const filtered: VehicleUsageRow[] = filterRows(
      this.rows(),
      this.columnFilters(),
    );
    return searchRows(filtered, this.globalSearch.query(), [
      (vehicleUsage: VehicleUsageRow): string => vehicleUsage.vehicleTypeName,
      (vehicleUsage: VehicleUsageRow): string => vehicleUsage.usages.join(', '),
      (vehicleUsage: VehicleUsageRow): string => vehicleUsage.status,
    ]);
  });

  protected readonly filteredTotal: Signal<number> = computed<number>(
    () => this.filteredRows().length,
  );

  private readonly sortedRows: Signal<VehicleUsageRow[]> = computed<
    VehicleUsageRow[]
  >(() => {
    const key: VehicleUsageColumnKey | null = this.sortKey();
    const accessor: ((vehicleUsage: VehicleUsageRow) => unknown) | null = key
      ? (vehicleUsage: VehicleUsageRow): unknown =>
          key === 'createdAt'
            ? new Date(vehicleUsage.createdAt)
            : key === 'usages'
              ? vehicleUsage.usages.join(', ')
              : vehicleUsage[key]
      : null;
    return sortRows(this.filteredRows(), accessor, this.sortDirection());
  });

  protected readonly pagedRows: Signal<VehicleUsageRow[]> = computed<
    VehicleUsageRow[]
  >(() => paginateRows(this.sortedRows(), this.page(), this.pageSize()));

  public constructor() {
    this.store.loadVehicleUsages();
    this.vehicleTypesStore.loadVehicleTypes();

    this.globalSearch.placeholder.set('Search vehicle usages…');
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

  protected submitDialog(dto: CreateVehicleUsageDto): void {
    this.saving.set(true);

    this.store.createVehicleUsage(dto, {
      next: (): void => {
        this.saving.set(false);
        this.showDialog.set(false);
        this.notificationService.show({
          message: 'Vehicle usage created successfully.',
          type: 'success',
        });
      },
      error: (message: string): void => {
        this.saving.set(false);
        this.notificationService.show({ message, type: 'error' });
      },
    });
  }

  protected onFilterChange<K extends keyof VehicleUsageFilters>(
    key: K,
    value: VehicleUsageFilters[K],
  ): void {
    this.filters.update(
      (current: VehicleUsageFilters): VehicleUsageFilters => ({
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
    this.filters.set({ ...INITIAL_VEHICLE_USAGE_FILTERS });
    this.page.set(1);
  }

  protected onSortChange(
    key: VehicleUsageColumnKey,
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
