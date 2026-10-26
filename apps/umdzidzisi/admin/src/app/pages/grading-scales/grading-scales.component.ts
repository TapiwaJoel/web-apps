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
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { OverlayModule } from '@angular/cdk/overlay';
import {
  CreateGradingScaleDto,
  EntityStatus,
  GradingScaleResponseDto,
  GradingScalesStore,
  GradingSystemResponseDto,
  GradingSystemsStore,
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
  KpiCard,
  KpiStatCardComponent,
  NotificationService,
  SortableColumnHeaderComponent,
  StatusPillComponent,
  TablePaginationComponent,
} from '@mushaviri/ui';
import { CreateGradingScaleDialogComponent } from './create-grading-scale-dialog/create-grading-scale-dialog.component';
import { GradingScaleDetailDrawerComponent } from './grading-scale-detail-drawer/grading-scale-detail-drawer.component';
import { GradingScaleRangeBarComponent } from './grading-scale-range-bar/grading-scale-range-bar.component';
import { ENTITY_STATUS_OPTIONS } from '../../shared/types/common/entity-status-options.const';
import { ENTITY_STATUS_TONES } from '../../shared/types/common/entity-status-tones.const';
import { SelectOption } from '../../shared/types/common/select-option.type';
import { GradingScaleColumnKey } from '../../shared/types/grading-scales/grading-scale-column-key.type';
import { GradingScaleFilters } from '../../shared/types/grading-scales/grading-scale-filters.type';
import { GradingScaleRow } from '../../shared/types/grading-scales/grading-scale-row.type';
import { INITIAL_GRADING_SCALE_FILTERS } from '../../shared/types/grading-scales/initial-grading-scale-filters.const';

const DEFAULT_PAGE_SIZE: number = 10;

@Component({
  selector: 'org-grading-scales',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    RouterLink,
    OverlayModule,
    CreateGradingScaleDialogComponent,
    GradingScaleDetailDrawerComponent,
    GradingScaleRangeBarComponent,
    StatusPillComponent,
    TablePaginationComponent,
    SortableColumnHeaderComponent,
    KpiStatCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './grading-scales.component.html',
})
export class GradingScalesComponent {
  private readonly store: InstanceType<typeof GradingScalesStore> =
    inject(GradingScalesStore);
  private readonly gradingSystemsStore: InstanceType<
    typeof GradingSystemsStore
  > = inject(GradingSystemsStore);
  private readonly notificationService: NotificationService =
    inject(NotificationService);
  private readonly globalSearch: GlobalSearchService =
    inject(GlobalSearchService);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);

  protected readonly statusOptions: SelectOption<EntityStatus>[] =
    ENTITY_STATUS_OPTIONS;

  protected readonly showCreateForm: WritableSignal<boolean> = signal(false);
  protected readonly creating: WritableSignal<boolean> = signal(false);
  protected readonly openMenuId: WritableSignal<string | null> = signal(null);

  protected readonly filters: WritableSignal<GradingScaleFilters> = signal({
    ...INITIAL_GRADING_SCALE_FILTERS,
  });
  protected readonly filtersOpen: WritableSignal<boolean> = signal(false);
  protected readonly sortKey: WritableSignal<GradingScaleColumnKey | null> =
    signal(null);
  protected readonly sortDirection: WritableSignal<SortDirection> =
    signal(null);
  protected readonly page: WritableSignal<number> = signal(1);
  protected readonly pageSize: WritableSignal<number> =
    signal(DEFAULT_PAGE_SIZE);

  protected readonly selectedGradingScaleId: Signal<string | null> = toSignal(
    this.route.paramMap.pipe(map((params: ParamMap) => params.get('id'))),
    { initialValue: null },
  );

  protected readonly gradingScales: Signal<GradingScaleResponseDto[]> =
    this.store.gradingScales;
  protected readonly gradingScalesLoading: Signal<boolean> =
    this.store.gradingScalesLoading;
  protected readonly gradingScalesError: Signal<string | null> =
    this.store.gradingScalesError;
  protected readonly gradingSystems: Signal<GradingSystemResponseDto[]> =
    this.gradingSystemsStore.gradingSystems;

  private readonly gradingSystemNamesById: Signal<Map<string, string>> =
    computed<Map<string, string>>(
      () =>
        new Map(
          this.gradingSystems().map(
            (system: GradingSystemResponseDto): [string, string] => [
              system._id,
              system.name,
            ],
          ),
        ),
    );

  protected readonly rows: Signal<GradingScaleRow[]> = computed<
    GradingScaleRow[]
  >(() =>
    this.gradingScales().map(
      (scale: GradingScaleResponseDto): GradingScaleRow => ({
        ...scale,
        statusTone: ENTITY_STATUS_TONES[scale.status] ?? 'info',
        gradingSystemName:
          this.gradingSystemNamesById().get(scale.gradingSystemId) ??
          scale.gradingSystemId,
      }),
    ),
  );

  protected readonly gradingScaleStats: Signal<KpiCard[]> = computed<KpiCard[]>(
    () => {
      const all: GradingScaleRow[] = this.rows();
      const countBy: (status: EntityStatus) => string = (
        status: EntityStatus,
      ): string =>
        String(
          all.filter(
            (scale: GradingScaleRow): boolean => scale.status === status,
          ).length,
        );
      return [
        {
          label: 'Total Scales',
          value: String(all.length),
          icon: 'fi fi-rr-chart-simple',
        },
        {
          label: 'Active',
          value: countBy(EntityStatus.ACTIVE),
          icon: 'fi fi-rr-check-circle',
        },
        {
          label: 'Inactive',
          value: countBy(EntityStatus.INACTIVE),
          icon: 'fi fi-rr-ban',
        },
        {
          label: 'Deleted',
          value: countBy(EntityStatus.DELETED),
          icon: 'fi fi-rr-trash',
        },
      ];
    },
  );

  protected readonly filteredGradingSystemName: Signal<string> =
    computed<string>(() => {
      const gradingSystemId: string = this.filters().gradingSystemId;
      return (
        this.gradingSystemNamesById().get(gradingSystemId) ?? gradingSystemId
      );
    });

  protected readonly filteredSystemScales: Signal<GradingScaleResponseDto[]> =
    computed<GradingScaleResponseDto[]>(() => {
      const gradingSystemId: string = this.filters().gradingSystemId;
      return this.gradingScales().filter(
        (scale: GradingScaleResponseDto): boolean =>
          scale.gradingSystemId === gradingSystemId,
      );
    });

  protected readonly activeFilterCount: Signal<number> = computed<number>(
    () =>
      Object.values(this.filters()).filter(
        (value: string | null): boolean => value !== '' && value !== null,
      ).length,
  );

  private readonly columnFilters: Signal<ColumnFilter<GradingScaleRow>[]> =
    computed<ColumnFilter<GradingScaleRow>[]>(() => {
      const current: GradingScaleFilters = this.filters();
      return [
        {
          accessor: (scale: GradingScaleRow): string => scale.symbol,
          predicate: containsPredicate,
          value: current.symbol,
        },
        {
          accessor: (scale: GradingScaleRow): string => scale.gradingSystemId,
          predicate: equalsPredicate,
          value: current.gradingSystemId,
        },
        {
          accessor: (scale: GradingScaleRow): string => scale.status,
          predicate: equalsPredicate,
          value: current.status,
        },
        {
          accessor: (scale: GradingScaleRow): Date => new Date(scale.createdAt),
          predicate: dateRangePredicate,
          value: { from: current.createdFrom, to: current.createdTo },
        },
      ];
    });

  protected readonly filteredRows: Signal<GradingScaleRow[]> = computed<
    GradingScaleRow[]
  >(() => {
    const filtered: GradingScaleRow[] = filterRows(
      this.rows(),
      this.columnFilters(),
    );
    return searchRows(filtered, this.globalSearch.query(), [
      (scale: GradingScaleRow): string => scale.symbol,
      (scale: GradingScaleRow): string => scale.gradingSystemName,
      (scale: GradingScaleRow): string => scale.description ?? '',
      (scale: GradingScaleRow): string => scale.status,
    ]);
  });

  protected readonly filteredTotal: Signal<number> = computed<number>(
    () => this.filteredRows().length,
  );

  private readonly sortedRows: Signal<GradingScaleRow[]> = computed<
    GradingScaleRow[]
  >(() => {
    const key: GradingScaleColumnKey | null = this.sortKey();
    const accessor: ((scale: GradingScaleRow) => unknown) | null = key
      ? (scale: GradingScaleRow): unknown =>
          key === 'createdAt' ? new Date(scale.createdAt) : scale[key]
      : null;
    return sortRows(this.filteredRows(), accessor, this.sortDirection());
  });

  protected readonly pagedRows: Signal<GradingScaleRow[]> = computed<
    GradingScaleRow[]
  >(() => paginateRows(this.sortedRows(), this.page(), this.pageSize()));

  public constructor() {
    this.store.loadGradingScales();
    this.gradingSystemsStore.loadGradingSystems();

    this.globalSearch.placeholder.set('Search grading scales…');
    inject(DestroyRef).onDestroy((): void => {
      this.globalSearch.placeholder.set('Search...');
      this.globalSearch.query.set('');
    });

    effect((): void => {
      this.globalSearch.query();
      this.page.set(1);
    });

    // Parent filters live in the URL so "View grading scales →" links land
    // pre-filtered and survive opening/closing a detail drawer.
    this.route.queryParamMap
      .pipe(takeUntilDestroyed())
      .subscribe((params: ParamMap): void => {
        this.filters.update(
          (current: GradingScaleFilters): GradingScaleFilters => ({
            ...current,
            gradingSystemId: params.get('gradingSystemId') ?? '',
          }),
        );
        this.page.set(1);
      });
  }

  protected onFilterChange<K extends keyof GradingScaleFilters>(
    key: K,
    value: GradingScaleFilters[K],
  ): void {
    this.filters.update(
      (current: GradingScaleFilters): GradingScaleFilters => ({
        ...current,
        [key]: value,
      }),
    );
    this.page.set(1);
    if (key === 'gradingSystemId') {
      this.syncQueryParams();
    }
  }

  protected toggleFilters(): void {
    this.filtersOpen.update((open: boolean): boolean => !open);
  }

  protected closeFilters(): void {
    this.filtersOpen.set(false);
  }

  protected resetFilters(): void {
    this.filters.set({ ...INITIAL_GRADING_SCALE_FILTERS });
    this.page.set(1);
    this.syncQueryParams();
  }

  protected onSortChange(
    key: GradingScaleColumnKey,
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

  protected submitCreate(dto: CreateGradingScaleDto): void {
    this.creating.set(true);

    this.store.createGradingScale(dto, {
      next: (): void => {
        this.creating.set(false);
        this.showCreateForm.set(false);
        this.notificationService.show({
          message: 'Grading scale created successfully.',
          type: 'success',
        });
      },
      error: (message: string): void => {
        this.creating.set(false);
        this.notificationService.show({ message, type: 'error' });
      },
    });
  }

  protected toggleMenu(gradingScaleId: string): void {
    this.openMenuId.update((current: string | null): string | null =>
      current === gradingScaleId ? null : gradingScaleId,
    );
  }

  protected closeMenu(): void {
    this.openMenuId.set(null);
  }

  /** Mirrors the deep-linkable parent filter into the URL. */
  private syncQueryParams(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { gradingSystemId: this.filters().gradingSystemId || null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
