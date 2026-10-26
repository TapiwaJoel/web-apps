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
  CountryStatus,
  CreateEducationalLevelDto,
  EducationalLevelResponseDto,
  EducationalLevelsStore,
  ExaminationBoardResponseDto,
  ExaminationBoardsStore,
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
import { CreateEducationalLevelDialogComponent } from './create-educational-level-dialog/create-educational-level-dialog.component';
import { EducationalLevelDetailDrawerComponent } from './educational-level-detail-drawer/educational-level-detail-drawer.component';
import { COUNTRY_STATUS_OPTIONS } from '../../shared/types/common/country-status-options.const';
import { COUNTRY_STATUS_TONES } from '../../shared/types/common/country-status-tones.const';
import { SelectOption } from '../../shared/types/common/select-option.type';
import { EducationalLevelColumnKey } from '../../shared/types/educational-levels/educational-level-column-key.type';
import { EducationalLevelFilters } from '../../shared/types/educational-levels/educational-level-filters.type';
import { EducationalLevelRow } from '../../shared/types/educational-levels/educational-level-row.type';
import { INITIAL_EDUCATIONAL_LEVEL_FILTERS } from '../../shared/types/educational-levels/initial-educational-level-filters.const';

const DEFAULT_PAGE_SIZE: number = 10;
/** Query param that deep-links this page pre-filtered to one board. */
const BOARD_QUERY_PARAM: string = 'examinationBoardId';

@Component({
  selector: 'org-educational-levels',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    RouterLink,
    OverlayModule,
    CreateEducationalLevelDialogComponent,
    EducationalLevelDetailDrawerComponent,
    StatusPillComponent,
    TablePaginationComponent,
    SortableColumnHeaderComponent,
    KpiStatCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './educational-levels.component.html',
})
export class EducationalLevelsComponent {
  protected readonly statusOptions: SelectOption<CountryStatus>[] =
    COUNTRY_STATUS_OPTIONS;

  private readonly store: InstanceType<typeof EducationalLevelsStore> = inject(
    EducationalLevelsStore,
  );
  private readonly examinationBoardsStore: InstanceType<
    typeof ExaminationBoardsStore
  > = inject(ExaminationBoardsStore);
  private readonly notificationService: NotificationService =
    inject(NotificationService);
  private readonly globalSearch: GlobalSearchService =
    inject(GlobalSearchService);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);

  protected readonly selectedEducationalLevelId: Signal<string | null> =
    toSignal(
      this.route.paramMap.pipe(map((params: ParamMap) => params.get('id'))),
      { initialValue: null },
    );

  protected readonly educationalLevels: Signal<EducationalLevelResponseDto[]> =
    this.store.educationalLevels;
  protected readonly educationalLevelsLoading: Signal<boolean> =
    this.store.educationalLevelsLoading;
  protected readonly educationalLevelsError: Signal<string | null> =
    this.store.educationalLevelsError;
  protected readonly examinationBoards: Signal<ExaminationBoardResponseDto[]> =
    this.examinationBoardsStore.examinationBoards;

  protected readonly showCreateForm: WritableSignal<boolean> = signal(false);
  protected readonly creating: WritableSignal<boolean> = signal(false);
  protected readonly openMenuId: WritableSignal<string | null> = signal(null);

  protected readonly filters: WritableSignal<EducationalLevelFilters> = signal({
    ...INITIAL_EDUCATIONAL_LEVEL_FILTERS,
    examinationBoardId:
      this.route.snapshot.queryParamMap.get(BOARD_QUERY_PARAM) ?? '',
  });
  protected readonly filtersOpen: WritableSignal<boolean> = signal(false);
  protected readonly sortKey: WritableSignal<EducationalLevelColumnKey | null> =
    signal(null);
  protected readonly sortDirection: WritableSignal<SortDirection> =
    signal(null);
  protected readonly page: WritableSignal<number> = signal(1);
  protected readonly pageSize: WritableSignal<number> =
    signal(DEFAULT_PAGE_SIZE);

  protected readonly examinationBoardNamesById: Signal<Map<string, string>> =
    computed<Map<string, string>>(
      () =>
        new Map(
          this.examinationBoards().map(
            (board: ExaminationBoardResponseDto): [string, string] => [
              board._id,
              board.name,
            ],
          ),
        ),
    );

  protected readonly rows: Signal<EducationalLevelRow[]> = computed<
    EducationalLevelRow[]
  >(() =>
    this.educationalLevels().map(
      (level: EducationalLevelResponseDto): EducationalLevelRow => ({
        ...level,
        statusTone: COUNTRY_STATUS_TONES[level.status] ?? 'info',
        examinationBoardName:
          this.examinationBoardNamesById().get(level.examinationBoardId) ??
          level.examinationBoardId,
      }),
    ),
  );

  protected readonly educationalLevelStats: Signal<KpiCard[]> = computed<
    KpiCard[]
  >(() => {
    const all: EducationalLevelRow[] = this.rows();
    const boards: Set<string> = new Set(
      all.map((level: EducationalLevelRow): string => level.examinationBoardId),
    );
    return [
      {
        label: 'Total Levels',
        value: String(all.length),
        icon: 'fi fi-rr-layers',
      },
      {
        label: 'Active',
        value: String(
          all.filter(
            (level: EducationalLevelRow): boolean =>
              level.status === CountryStatus.ACTIVE,
          ).length,
        ),
        icon: 'fi fi-rr-check-circle',
      },
      {
        label: 'Inactive',
        value: String(
          all.filter(
            (level: EducationalLevelRow): boolean =>
              level.status === CountryStatus.INACTIVE,
          ).length,
        ),
        icon: 'fi fi-rr-ban',
      },
      {
        label: 'Boards Covered',
        value: String(boards.size),
        icon: 'fi fi-rr-diploma',
      },
    ];
  });

  /** Name of the board currently filtered on, for the removable chip. */
  protected readonly boardFilterName: Signal<string | null> = computed<
    string | null
  >(() => {
    const boardId: string = this.filters().examinationBoardId;
    if (!boardId) {
      return null;
    }
    return this.examinationBoardNamesById().get(boardId) ?? 'Unknown board';
  });

  protected readonly activeFilterCount: Signal<number> = computed<number>(
    () =>
      Object.values(this.filters()).filter(
        (value: string | null): boolean => value !== '' && value !== null,
      ).length,
  );

  private readonly columnFilters: Signal<ColumnFilter<EducationalLevelRow>[]> =
    computed<ColumnFilter<EducationalLevelRow>[]>(() => {
      const current: EducationalLevelFilters = this.filters();
      return [
        {
          accessor: (level: EducationalLevelRow): string => level.name,
          predicate: containsPredicate,
          value: current.name,
        },
        {
          accessor: (level: EducationalLevelRow): string =>
            level.examinationBoardId,
          predicate: equalsPredicate,
          value: current.examinationBoardId,
        },
        {
          accessor: (level: EducationalLevelRow): string => level.status,
          predicate: equalsPredicate,
          value: current.status,
        },
        {
          accessor: (level: EducationalLevelRow): Date =>
            new Date(level.createdAt),
          predicate: dateRangePredicate,
          value: { from: current.createdFrom, to: current.createdTo },
        },
      ];
    });

  protected readonly filteredRows: Signal<EducationalLevelRow[]> = computed<
    EducationalLevelRow[]
  >(() => {
    const filtered: EducationalLevelRow[] = filterRows(
      this.rows(),
      this.columnFilters(),
    );
    return searchRows(filtered, this.globalSearch.query(), [
      (level: EducationalLevelRow): string => level.name,
      (level: EducationalLevelRow): string => level.examinationBoardName,
      (level: EducationalLevelRow): string => level.description ?? '',
      (level: EducationalLevelRow): string => level.status,
    ]);
  });

  protected readonly filteredTotal: Signal<number> = computed<number>(
    () => this.filteredRows().length,
  );

  private readonly sortedRows: Signal<EducationalLevelRow[]> = computed<
    EducationalLevelRow[]
  >(() => {
    const key: EducationalLevelColumnKey | null = this.sortKey();
    const accessor: ((level: EducationalLevelRow) => unknown) | null = key
      ? (level: EducationalLevelRow): unknown =>
          key === 'createdAt' ? new Date(level.createdAt) : (level[key] ?? '')
      : null;
    return sortRows(this.filteredRows(), accessor, this.sortDirection());
  });

  protected readonly pagedRows: Signal<EducationalLevelRow[]> = computed<
    EducationalLevelRow[]
  >(() => paginateRows(this.sortedRows(), this.page(), this.pageSize()));

  public constructor() {
    this.store.loadEducationalLevels();
    this.examinationBoardsStore.loadExaminationBoards();

    this.globalSearch.placeholder.set('Search educational levels…');
    inject(DestroyRef).onDestroy((): void => {
      this.globalSearch.placeholder.set('Search...');
      this.globalSearch.query.set('');
    });

    effect((): void => {
      this.globalSearch.query();
      this.page.set(1);
    });

    // Keep the board filter in step with `?examinationBoardId=` so links from
    // a board's drawer (and back/forward navigation) land pre-filtered.
    this.route.queryParamMap
      .pipe(takeUntilDestroyed())
      .subscribe((params: ParamMap): void => {
        const boardId: string = params.get(BOARD_QUERY_PARAM) ?? '';
        if (boardId !== this.filters().examinationBoardId) {
          this.onFilterChange('examinationBoardId', boardId);
        }
      });
  }

  protected onFilterChange<K extends keyof EducationalLevelFilters>(
    key: K,
    value: EducationalLevelFilters[K],
  ): void {
    this.filters.update(
      (current: EducationalLevelFilters): EducationalLevelFilters => ({
        ...current,
        [key]: value,
      }),
    );
    this.page.set(1);
    if (key === 'examinationBoardId') {
      this.syncBoardQueryParam(value as string);
    }
  }

  protected clearBoardFilter(): void {
    this.onFilterChange('examinationBoardId', '');
  }

  protected toggleFilters(): void {
    this.filtersOpen.update((open: boolean): boolean => !open);
  }

  protected closeFilters(): void {
    this.filtersOpen.set(false);
  }

  protected resetFilters(): void {
    this.filters.set({ ...INITIAL_EDUCATIONAL_LEVEL_FILTERS });
    this.page.set(1);
    this.syncBoardQueryParam('');
  }

  protected onSortChange(
    key: EducationalLevelColumnKey,
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

  protected submitCreate(dto: CreateEducationalLevelDto): void {
    this.creating.set(true);

    this.store.createEducationalLevel(dto, {
      next: (): void => {
        this.creating.set(false);
        this.showCreateForm.set(false);
        this.notificationService.show({
          message: 'Educational level created.',
          type: 'success',
        });
      },
      error: (message: string): void => {
        this.creating.set(false);
        this.notificationService.show({ message, type: 'error' });
      },
    });
  }

  protected toggleMenu(levelId: string): void {
    this.openMenuId.update((current: string | null): string | null =>
      current === levelId ? null : levelId,
    );
  }

  protected closeMenu(): void {
    this.openMenuId.set(null);
  }

  private syncBoardQueryParam(boardId: string): void {
    const current: string =
      this.route.snapshot.queryParamMap.get(BOARD_QUERY_PARAM) ?? '';
    if (current === boardId) {
      return;
    }
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { [BOARD_QUERY_PARAM]: boardId || null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
