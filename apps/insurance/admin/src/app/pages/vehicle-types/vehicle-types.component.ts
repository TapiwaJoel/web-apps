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
  CreateVehicleTypeDto,
  EntityStatus,
  VehicleTypeResponseDto,
  VehicleTypesStore,
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
} from '@mushaviri/ui';
import { CreateVehicleTypeDialogComponent } from './create-vehicle-type-dialog/create-vehicle-type-dialog.component';
import { VehicleTypeDetailDrawerComponent } from './vehicle-type-detail-drawer/vehicle-type-detail-drawer.component';
import { INITIAL_VEHICLE_TYPE_FILTERS } from '../../shared/types/vehicle-types/initial-vehicle-type-filters.const';
import { VehicleTypeColumnKey } from '../../shared/types/vehicle-types/vehicle-type-column-key.type';
import { VehicleTypeFilters } from '../../shared/types/vehicle-types/vehicle-type-filters.type';
import { VehicleTypeRow } from '../../shared/types/vehicle-types/vehicle-type-row.type';
import { STATUS_TONES } from '../../shared/types/vehicle-types/status-tones.const';

const DEFAULT_PAGE_SIZE: number = 10;

@Component({
  selector: 'org-vehicle-types',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    RouterLink,
    OverlayModule,
    CreateVehicleTypeDialogComponent,
    VehicleTypeDetailDrawerComponent,
    StatusPillComponent,
    TablePaginationComponent,
    SortableColumnHeaderComponent,
    KpiStatCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './vehicle-types.component.html',
})
export class VehicleTypesComponent {
  protected readonly EntityStatus: typeof EntityStatus = EntityStatus;

  private readonly store: InstanceType<typeof VehicleTypesStore> =
    inject(VehicleTypesStore);
  private readonly notificationService: NotificationService =
    inject(NotificationService);
  private readonly globalSearch: GlobalSearchService =
    inject(GlobalSearchService);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);

  protected readonly selectedVehicleTypeId: Signal<string | null> = toSignal(
    this.route.paramMap.pipe(map((params: ParamMap) => params.get('id'))),
    { initialValue: null },
  );

  protected readonly vehicleTypesLoading: Signal<boolean> =
    this.store.vehicleTypesLoading;
  protected readonly vehicleTypesError: Signal<string | null> =
    this.store.vehicleTypesError;

  protected readonly showCreateForm: WritableSignal<boolean> = signal(false);
  protected readonly creating: WritableSignal<boolean> = signal(false);
  protected readonly openMenuId: WritableSignal<string | null> = signal(null);

  protected readonly filters: WritableSignal<VehicleTypeFilters> = signal({
    ...INITIAL_VEHICLE_TYPE_FILTERS,
  });
  protected readonly filtersOpen: WritableSignal<boolean> = signal(false);
  protected readonly sortKey: WritableSignal<VehicleTypeColumnKey | null> =
    signal(null);
  protected readonly sortDirection: WritableSignal<SortDirection> =
    signal(null);
  protected readonly page: WritableSignal<number> = signal(1);
  protected readonly pageSize: WritableSignal<number> =
    signal(DEFAULT_PAGE_SIZE);

  protected readonly rows: Signal<VehicleTypeRow[]> = computed<
    VehicleTypeRow[]
  >(() =>
    this.store
      .vehicleTypes()
      .map((vehicleType: VehicleTypeResponseDto): VehicleTypeRow => ({
        ...vehicleType,
        statusTone: STATUS_TONES[vehicleType.status] ?? 'info',
      })),
  );

  protected readonly vehicleTypeStats: Signal<KpiCard[]> = computed<KpiCard[]>(
    () => {
      const all: VehicleTypeRow[] = this.rows();
      return [
        {
          label: 'Total Vehicle Types',
          value: String(all.length),
          icon: 'fi fi-rr-car-side',
        },
        {
          label: 'Active',
          value: String(
            all.filter(
              (vehicleType: VehicleTypeRow) =>
                vehicleType.status === EntityStatus.ACTIVE,
            ).length,
          ),
          icon: 'fi fi-rr-check-circle',
        },
        {
          label: 'Inactive',
          value: String(
            all.filter(
              (vehicleType: VehicleTypeRow) =>
                vehicleType.status === EntityStatus.INACTIVE,
            ).length,
          ),
          icon: 'fi fi-rr-ban',
        },
      ];
    },
  );

  protected readonly statusOptions: Signal<string[]> = computed<string[]>(() =>
    Array.from(
      new Set(
        this.rows().map(
          (vehicleType: VehicleTypeRow): string => vehicleType.status,
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

  private readonly columnFilters: Signal<ColumnFilter<VehicleTypeRow>[]> =
    computed<ColumnFilter<VehicleTypeRow>[]>(() => {
      const current: VehicleTypeFilters = this.filters();
      return [
        {
          accessor: (vehicleType: VehicleTypeRow): string => vehicleType.name,
          predicate: containsPredicate,
          value: current.name,
        },
        {
          accessor: (vehicleType: VehicleTypeRow): string => vehicleType.status,
          predicate: equalsPredicate,
          value: current.status,
        },
        {
          accessor: (vehicleType: VehicleTypeRow): Date =>
            new Date(vehicleType.createdAt),
          predicate: dateRangePredicate,
          value: { from: current.createdFrom, to: current.createdTo },
        },
      ];
    });

  protected readonly filteredRows: Signal<VehicleTypeRow[]> = computed<
    VehicleTypeRow[]
  >(() => {
    const filtered: VehicleTypeRow[] = filterRows(
      this.rows(),
      this.columnFilters(),
    );
    return searchRows(filtered, this.globalSearch.query(), [
      (vehicleType: VehicleTypeRow): string => vehicleType.name,
      (vehicleType: VehicleTypeRow): string => vehicleType.description ?? '',
      (vehicleType: VehicleTypeRow): string => vehicleType.status,
    ]);
  });

  protected readonly filteredTotal: Signal<number> = computed<number>(
    () => this.filteredRows().length,
  );

  private readonly sortedRows: Signal<VehicleTypeRow[]> = computed<
    VehicleTypeRow[]
  >(() => {
    const key: VehicleTypeColumnKey | null = this.sortKey();
    const accessor: ((vehicleType: VehicleTypeRow) => unknown) | null = key
      ? (vehicleType: VehicleTypeRow): unknown =>
          key === 'createdAt'
            ? new Date(vehicleType.createdAt)
            : vehicleType[key]
      : null;
    return sortRows(this.filteredRows(), accessor, this.sortDirection());
  });

  protected readonly pagedRows: Signal<VehicleTypeRow[]> = computed<
    VehicleTypeRow[]
  >(() => paginateRows(this.sortedRows(), this.page(), this.pageSize()));

  public constructor() {
    this.store.loadVehicleTypes();

    this.globalSearch.placeholder.set('Search vehicle types…');
    inject(DestroyRef).onDestroy((): void => {
      this.globalSearch.placeholder.set('Search...');
      this.globalSearch.query.set('');
    });

    effect((): void => {
      this.globalSearch.query();
      this.page.set(1);
    });
  }

  protected onFilterChange<K extends keyof VehicleTypeFilters>(
    key: K,
    value: VehicleTypeFilters[K],
  ): void {
    this.filters.update((current: VehicleTypeFilters): VehicleTypeFilters => ({
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
    this.filters.set({ ...INITIAL_VEHICLE_TYPE_FILTERS });
    this.page.set(1);
  }

  protected onSortChange(
    key: VehicleTypeColumnKey,
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

  protected submitCreate(dto: CreateVehicleTypeDto): void {
    this.creating.set(true);

    this.store.createVehicleType(dto, {
      next: (): void => {
        this.creating.set(false);
        this.showCreateForm.set(false);
        this.notificationService.show({
          message: 'Vehicle type created successfully.',
          type: 'success',
        });
      },
      error: (message: string): void => {
        this.creating.set(false);
        this.notificationService.show({ message, type: 'error' });
      },
    });
  }

  protected toggleMenu(vehicleTypeId: string): void {
    this.openMenuId.update((current: string | null) =>
      current === vehicleTypeId ? null : vehicleTypeId,
    );
  }

  protected closeMenu(): void {
    this.openMenuId.set(null);
  }
}
