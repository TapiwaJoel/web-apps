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
  CreateGradingSystemDto,
  EntityStatus,
  ExaminationResponseDto,
  ExaminationsStore,
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
import { CreateGradingSystemDialogComponent } from './create-grading-system-dialog/create-grading-system-dialog.component';
import { GradingSystemDetailDrawerComponent } from './grading-system-detail-drawer/grading-system-detail-drawer.component';
import { ENTITY_STATUS_OPTIONS } from '../../shared/types/common/entity-status-options.const';
import { ENTITY_STATUS_TONES } from '../../shared/types/common/entity-status-tones.const';
import { SelectOption } from '../../shared/types/common/select-option.type';
import { GradingSystemColumnKey } from '../../shared/types/grading-systems/grading-system-column-key.type';
import { GradingSystemFilters } from '../../shared/types/grading-systems/grading-system-filters.type';
import { GradingSystemRow } from '../../shared/types/grading-systems/grading-system-row.type';
import { INITIAL_GRADING_SYSTEM_FILTERS } from '../../shared/types/grading-systems/initial-grading-system-filters.const';

const DEFAULT_PAGE_SIZE: number = 10;

@Component({
  selector: 'org-grading-systems',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    RouterLink,
    OverlayModule,
    CreateGradingSystemDialogComponent,
    GradingSystemDetailDrawerComponent,
    StatusPillComponent,
    TablePaginationComponent,
    SortableColumnHeaderComponent,
    KpiStatCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './grading-systems.component.html',
})
export class GradingSystemsComponent {
  private readonly store: InstanceType<typeof GradingSystemsStore> =
    inject(GradingSystemsStore);
  private readonly examinationsStore: InstanceType<typeof ExaminationsStore> =
    inject(ExaminationsStore);
  private readonly gradingScalesStore: InstanceType<typeof GradingScalesStore> =
    inject(GradingScalesStore);
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

  protected readonly filters: WritableSignal<GradingSystemFilters> = signal({
    ...INITIAL_GRADING_SYSTEM_FILTERS,
  });
  protected readonly filtersOpen: WritableSignal<boolean> = signal(false);
  protected readonly sortKey: WritableSignal<GradingSystemColumnKey | null> =
    signal(null);
  protected readonly sortDirection: WritableSignal<SortDirection> =
    signal(null);
  protected readonly page: WritableSignal<number> = signal(1);
  protected readonly pageSize: WritableSignal<number> =
    signal(DEFAULT_PAGE_SIZE);

  protected readonly selectedGradingSystemId: Signal<string | null> = toSignal(
    this.route.paramMap.pipe(map((params: ParamMap) => params.get('id'))),
    { initialValue: null },
  );

  protected readonly gradingSystemsLoading: Signal<boolean> =
    this.store.gradingSystemsLoading;
  protected readonly gradingSystemsError: Signal<string | null> =
    this.store.gradingSystemsError;
  protected readonly examinations: Signal<ExaminationResponseDto[]> =
    this.examinationsStore.examinations;

  private readonly examinationNamesById: Signal<Map<string, string>> = computed<
    Map<string, string>
  >(
    () =>
      new Map(
        this.examinations().map(
          (examination: ExaminationResponseDto): [string, string] => [
            examination._id,
            examination.name,
          ],
        ),
      ),
  );

  private readonly scaleCountsBySystemId: Signal<Map<string, number>> =
    computed<Map<string, number>>(() => {
      const counts: Map<string, number> = new Map<string, number>();
      this.gradingScalesStore
        .gradingScales()
        .forEach((scale: GradingScaleResponseDto): void => {
          counts.set(
            scale.gradingSystemId,
            (counts.get(scale.gradingSystemId) ?? 0) + 1,
          );
        });
      return counts;
    });

  protected readonly rows: Signal<GradingSystemRow[]> = computed<
    GradingSystemRow[]
  >(() =>
    this.store
      .gradingSystems()
      .map((system: GradingSystemResponseDto): GradingSystemRow => ({
        ...system,
        statusTone: ENTITY_STATUS_TONES[system.status] ?? 'info',
        examinationName:
          this.examinationNamesById().get(system.examinationId) ??
          system.examinationId,
        scaleCount: this.scaleCountsBySystemId().get(system._id) ?? 0,
      })),
  );

  protected readonly gradingSystemStats: Signal<KpiCard[]> = computed<
    KpiCard[]
  >(() => {
    const all: GradingSystemRow[] = this.rows();
    const countBy: (status: EntityStatus) => string = (
      status: EntityStatus,
    ): string =>
      String(
        all.filter(
          (system: GradingSystemRow): boolean => system.status === status,
        ).length,
      );
    return [
      {
        label: 'Total Grading Systems',
        value: String(all.length),
        icon: 'fi fi-rr-diploma',
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
        label: 'Without Scales',
        value: String(
          all.filter((system: GradingSystemRow): boolean => !system.scaleCount)
            .length,
        ),
        icon: 'fi fi-rr-exclamation',
      },
    ];
  });

  protected readonly filteredExaminationName: Signal<string> = computed<string>(
    () => {
      const examinationId: string = this.filters().examinationId;
      return this.examinationNamesById().get(examinationId) ?? examinationId;
    },
  );

  protected readonly activeFilterCount: Signal<number> = computed<number>(
    () =>
      Object.values(this.filters()).filter(
        (value: string | null): boolean => value !== '' && value !== null,
      ).length,
  );

  private readonly columnFilters: Signal<ColumnFilter<GradingSystemRow>[]> =
    computed<ColumnFilter<GradingSystemRow>[]>(() => {
      const current: GradingSystemFilters = this.filters();
      return [
        {
          accessor: (system: GradingSystemRow): string => system.name,
          predicate: containsPredicate,
          value: current.name,
        },
        {
          accessor: (system: GradingSystemRow): string => system.examinationId,
          predicate: equalsPredicate,
          value: current.examinationId,
        },
        {
          accessor: (system: GradingSystemRow): string => system.status,
          predicate: equalsPredicate,
          value: current.status,
        },
        {
          accessor: (system: GradingSystemRow): Date =>
            new Date(system.createdAt),
          predicate: dateRangePredicate,
          value: { from: current.createdFrom, to: current.createdTo },
        },
      ];
    });

  protected readonly filteredRows: Signal<GradingSystemRow[]> = computed<
    GradingSystemRow[]
  >(() => {
    const filtered: GradingSystemRow[] = filterRows(
      this.rows(),
      this.columnFilters(),
    );
    return searchRows(filtered, this.globalSearch.query(), [
      (system: GradingSystemRow): string => system.name,
      (system: GradingSystemRow): string => system.examinationName,
      (system: GradingSystemRow): string => system.description ?? '',
      (system: GradingSystemRow): string => system.status,
    ]);
  });

  protected readonly filteredTotal: Signal<number> = computed<number>(
    () => this.filteredRows().length,
  );

  private readonly sortedRows: Signal<GradingSystemRow[]> = computed<
    GradingSystemRow[]
  >(() => {
    const key: GradingSystemColumnKey | null = this.sortKey();
    const accessor: ((system: GradingSystemRow) => unknown) | null = key
      ? (system: GradingSystemRow): unknown =>
          key === 'createdAt' ? new Date(system.createdAt) : system[key]
      : null;
    return sortRows(this.filteredRows(), accessor, this.sortDirection());
  });

  protected readonly pagedRows: Signal<GradingSystemRow[]> = computed<
    GradingSystemRow[]
  >(() => paginateRows(this.sortedRows(), this.page(), this.pageSize()));

  public constructor() {
    this.store.loadGradingSystems();
    this.examinationsStore.loadExaminations();
    this.gradingScalesStore.loadGradingScales();

    this.globalSearch.placeholder.set('Search grading systems…');
    inject(DestroyRef).onDestroy((): void => {
      this.globalSearch.placeholder.set('Search...');
      this.globalSearch.query.set('');
    });

    effect((): void => {
      this.globalSearch.query();
      this.page.set(1);
    });

    // Parent filters live in the URL so "View grading systems →" links land
    // pre-filtered and survive opening/closing a detail drawer.
    this.route.queryParamMap
      .pipe(takeUntilDestroyed())
      .subscribe((params: ParamMap): void => {
        this.filters.update(
          (current: GradingSystemFilters): GradingSystemFilters => ({
            ...current,
            examinationId: params.get('examinationId') ?? '',
          }),
        );
        this.page.set(1);
      });
  }

  protected onFilterChange<K extends keyof GradingSystemFilters>(
    key: K,
    value: GradingSystemFilters[K],
  ): void {
    this.filters.update(
      (current: GradingSystemFilters): GradingSystemFilters => ({
        ...current,
        [key]: value,
      }),
    );
    this.page.set(1);
    if (key === 'examinationId') {
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
    this.filters.set({ ...INITIAL_GRADING_SYSTEM_FILTERS });
    this.page.set(1);
    this.syncQueryParams();
  }

  protected onSortChange(
    key: GradingSystemColumnKey,
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

  protected submitCreate(dto: CreateGradingSystemDto): void {
    this.creating.set(true);

    this.store.createGradingSystem(dto, {
      next: (): void => {
        this.creating.set(false);
        this.showCreateForm.set(false);
        this.notificationService.show({
          message: 'Grading system created successfully.',
          type: 'success',
        });
      },
      error: (message: string): void => {
        this.creating.set(false);
        this.notificationService.show({ message, type: 'error' });
      },
    });
  }

  protected toggleMenu(gradingSystemId: string): void {
    this.openMenuId.update((current: string | null): string | null =>
      current === gradingSystemId ? null : gradingSystemId,
    );
  }

  protected closeMenu(): void {
    this.openMenuId.set(null);
  }

  /** Mirrors the deep-linkable parent filter into the URL. */
  private syncQueryParams(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { examinationId: this.filters().examinationId || null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
