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
  CreateGradeDto,
  EducationalLevelResponseDto,
  EducationalLevelsStore,
  EntityStatus,
  ExaminationBoardResponseDto,
  ExaminationBoardsStore,
  GradeResponseDto,
  GradesStore,
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
import { CreateGradeDialogComponent } from './create-grade-dialog/create-grade-dialog.component';
import { GradeDetailDrawerComponent } from './grade-detail-drawer/grade-detail-drawer.component';
import { ENTITY_STATUS_OPTIONS } from '../../shared/types/common/entity-status-options.const';
import { ENTITY_STATUS_TONES } from '../../shared/types/common/entity-status-tones.const';
import { SelectOption } from '../../shared/types/common/select-option.type';
import { GradeColumnKey } from '../../shared/types/grades/grade-column-key.type';
import { GradeFilters } from '../../shared/types/grades/grade-filters.type';
import { GradeRow } from '../../shared/types/grades/grade-row.type';
import { INITIAL_GRADE_FILTERS } from '../../shared/types/grades/initial-grade-filters.const';
import { LevelOption } from '../../shared/types/grades/level-option.type';

const DEFAULT_PAGE_SIZE: number = 10;
/** Query param that deep-links this page pre-filtered to one level. */
const LEVEL_QUERY_PARAM: string = 'educationalLevelId';

@Component({
  selector: 'org-grades',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    RouterLink,
    OverlayModule,
    CreateGradeDialogComponent,
    GradeDetailDrawerComponent,
    StatusPillComponent,
    TablePaginationComponent,
    SortableColumnHeaderComponent,
    KpiStatCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './grades.component.html',
})
export class GradesComponent {
  protected readonly statusOptions: SelectOption<EntityStatus>[] =
    ENTITY_STATUS_OPTIONS;

  private readonly store: InstanceType<typeof GradesStore> =
    inject(GradesStore);
  private readonly educationalLevelsStore: InstanceType<
    typeof EducationalLevelsStore
  > = inject(EducationalLevelsStore);
  private readonly examinationBoardsStore: InstanceType<
    typeof ExaminationBoardsStore
  > = inject(ExaminationBoardsStore);
  private readonly notificationService: NotificationService =
    inject(NotificationService);
  private readonly globalSearch: GlobalSearchService =
    inject(GlobalSearchService);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);

  protected readonly selectedGradeId: Signal<string | null> = toSignal(
    this.route.paramMap.pipe(map((params: ParamMap) => params.get('id'))),
    { initialValue: null },
  );

  protected readonly grades: Signal<GradeResponseDto[]> = this.store.grades;
  protected readonly gradesLoading: Signal<boolean> = this.store.gradesLoading;
  protected readonly gradesError: Signal<string | null> =
    this.store.gradesError;
  protected readonly educationalLevels: Signal<EducationalLevelResponseDto[]> =
    this.educationalLevelsStore.educationalLevels;
  protected readonly examinationBoards: Signal<ExaminationBoardResponseDto[]> =
    this.examinationBoardsStore.examinationBoards;

  protected readonly showCreateForm: WritableSignal<boolean> = signal(false);
  protected readonly creating: WritableSignal<boolean> = signal(false);
  protected readonly openMenuId: WritableSignal<string | null> = signal(null);

  protected readonly filters: WritableSignal<GradeFilters> = signal({
    ...INITIAL_GRADE_FILTERS,
    educationalLevelId:
      this.route.snapshot.queryParamMap.get(LEVEL_QUERY_PARAM) ?? '',
  });
  protected readonly filtersOpen: WritableSignal<boolean> = signal(false);
  protected readonly sortKey: WritableSignal<GradeColumnKey | null> =
    signal(null);
  protected readonly sortDirection: WritableSignal<SortDirection> =
    signal(null);
  protected readonly page: WritableSignal<number> = signal(1);
  protected readonly pageSize: WritableSignal<number> =
    signal(DEFAULT_PAGE_SIZE);

  private readonly examinationBoardNamesById: Signal<Map<string, string>> =
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

  /** Every level as "Level · Board", sorted by label. */
  protected readonly levelOptions: Signal<LevelOption[]> = computed<
    LevelOption[]
  >(() =>
    this.educationalLevels()
      .map((level: EducationalLevelResponseDto): LevelOption => ({
        id: level._id,
        examinationBoardId: level.examinationBoardId,
        label: `${level.name} · ${
          this.examinationBoardNamesById().get(level.examinationBoardId) ??
          level.examinationBoardId
        }`,
      }))
      .sort((a: LevelOption, b: LevelOption): number =>
        a.label.localeCompare(b.label),
      ),
  );

  private readonly levelOptionsById: Signal<Map<string, LevelOption>> =
    computed<Map<string, LevelOption>>(
      () =>
        new Map(
          this.levelOptions().map(
            (option: LevelOption): [string, LevelOption] => [option.id, option],
          ),
        ),
    );

  /** Level filter options, narrowed to the board filter when one is set. */
  protected readonly filterLevelOptions: Signal<LevelOption[]> = computed<
    LevelOption[]
  >(() => {
    const boardId: string = this.filters().examinationBoardId;
    return boardId
      ? this.levelOptions().filter(
          (option: LevelOption): boolean =>
            option.examinationBoardId === boardId,
        )
      : this.levelOptions();
  });

  /** Ids of grades whose displayOrder is shared with another grade in the same level. */
  private readonly conflictingGradeIds: Signal<Set<string>> = computed<
    Set<string>
  >(() => {
    const seen: Map<string, string[]> = new Map();
    for (const grade of this.grades()) {
      const key: string = `${grade.educationalLevelId}|${grade.displayOrder}`;
      seen.set(key, [...(seen.get(key) ?? []), grade._id]);
    }
    return new Set(
      Array.from(seen.values())
        .filter((ids: string[]): boolean => ids.length > 1)
        .flat(),
    );
  });

  protected readonly rows: Signal<GradeRow[]> = computed<GradeRow[]>(() =>
    this.grades().map((grade: GradeResponseDto): GradeRow => {
      const level: LevelOption | undefined = this.levelOptionsById().get(
        grade.educationalLevelId,
      );
      return {
        ...grade,
        statusTone: ENTITY_STATUS_TONES[grade.status] ?? 'info',
        examinationBoardId: level?.examinationBoardId ?? '',
        levelLabel: level?.label ?? grade.educationalLevelId,
      };
    }),
  );

  protected readonly gradeStats: Signal<KpiCard[]> = computed<KpiCard[]>(() => {
    const all: GradeRow[] = this.rows();
    const levels: Set<string> = new Set(
      all.map((grade: GradeRow): string => grade.educationalLevelId),
    );
    return [
      {
        label: 'Total Grades',
        value: String(all.length),
        icon: 'fi fi-rr-stairs',
      },
      {
        label: 'Active',
        value: String(
          all.filter(
            (grade: GradeRow): boolean => grade.status === EntityStatus.ACTIVE,
          ).length,
        ),
        icon: 'fi fi-rr-check-circle',
      },
      {
        label: 'Inactive',
        value: String(
          all.filter(
            (grade: GradeRow): boolean =>
              grade.status === EntityStatus.INACTIVE,
          ).length,
        ),
        icon: 'fi fi-rr-ban',
      },
      {
        label: 'Levels Covered',
        value: String(levels.size),
        icon: 'fi fi-rr-layers',
      },
    ];
  });

  protected readonly boardFilterName: Signal<string | null> = computed<
    string | null
  >(() => {
    const boardId: string = this.filters().examinationBoardId;
    return boardId
      ? (this.examinationBoardNamesById().get(boardId) ?? 'Unknown board')
      : null;
  });

  protected readonly levelFilterLabel: Signal<string | null> = computed<
    string | null
  >(() => {
    const levelId: string = this.filters().educationalLevelId;
    return levelId
      ? (this.levelOptionsById().get(levelId)?.label ?? 'Unknown level')
      : null;
  });

  protected readonly activeFilterCount: Signal<number> = computed<number>(
    () =>
      Object.values(this.filters()).filter(
        (value: string | null): boolean => value !== '' && value !== null,
      ).length,
  );

  private readonly columnFilters: Signal<ColumnFilter<GradeRow>[]> = computed<
    ColumnFilter<GradeRow>[]
  >(() => {
    const current: GradeFilters = this.filters();
    return [
      {
        accessor: (grade: GradeRow): string => grade.name,
        predicate: containsPredicate,
        value: current.name,
      },
      {
        accessor: (grade: GradeRow): string => grade.examinationBoardId,
        predicate: equalsPredicate,
        value: current.examinationBoardId,
      },
      {
        accessor: (grade: GradeRow): string => grade.educationalLevelId,
        predicate: equalsPredicate,
        value: current.educationalLevelId,
      },
      {
        accessor: (grade: GradeRow): string => grade.status,
        predicate: equalsPredicate,
        value: current.status,
      },
      {
        accessor: (grade: GradeRow): Date => new Date(grade.createdAt),
        predicate: dateRangePredicate,
        value: { from: current.createdFrom, to: current.createdTo },
      },
    ];
  });

  protected readonly filteredRows: Signal<GradeRow[]> = computed<GradeRow[]>(
    () => {
      const filtered: GradeRow[] = filterRows(
        this.rows(),
        this.columnFilters(),
      );
      return searchRows(filtered, this.globalSearch.query(), [
        (grade: GradeRow): string => grade.name,
        (grade: GradeRow): string => grade.levelLabel,
        (grade: GradeRow): string => grade.status,
      ]);
    },
  );

  protected readonly filteredTotal: Signal<number> = computed<number>(
    () => this.filteredRows().length,
  );

  /** Column sort when one is chosen; otherwise level, then displayOrder. */
  private readonly sortedRows: Signal<GradeRow[]> = computed<GradeRow[]>(() => {
    const key: GradeColumnKey | null = this.sortKey();
    const direction: SortDirection = this.sortDirection();
    if (key && direction) {
      return sortRows(
        this.filteredRows(),
        (grade: GradeRow): unknown =>
          key === 'createdAt' ? new Date(grade.createdAt) : grade[key],
        direction,
      );
    }
    return [...this.filteredRows()].sort(
      (a: GradeRow, b: GradeRow): number =>
        a.levelLabel.localeCompare(b.levelLabel) ||
        a.displayOrder - b.displayOrder,
    );
  });

  protected readonly pagedRows: Signal<GradeRow[]> = computed<GradeRow[]>(() =>
    paginateRows(this.sortedRows(), this.page(), this.pageSize()),
  );

  public constructor() {
    this.store.loadGrades();
    this.educationalLevelsStore.loadEducationalLevels();
    this.examinationBoardsStore.loadExaminationBoards();

    this.globalSearch.placeholder.set('Search grades…');
    inject(DestroyRef).onDestroy((): void => {
      this.globalSearch.placeholder.set('Search...');
      this.globalSearch.query.set('');
    });

    effect((): void => {
      this.globalSearch.query();
      this.page.set(1);
    });

    // Keep the level filter in step with `?educationalLevelId=` so links from
    // a level's drawer (and back/forward navigation) land pre-filtered.
    this.route.queryParamMap
      .pipe(takeUntilDestroyed())
      .subscribe((params: ParamMap): void => {
        const levelId: string = params.get(LEVEL_QUERY_PARAM) ?? '';
        if (levelId !== this.filters().educationalLevelId) {
          this.onFilterChange('educationalLevelId', levelId);
        }
      });
  }

  protected isDisplayOrderConflict(gradeId: string): boolean {
    return this.conflictingGradeIds().has(gradeId);
  }

  protected onFilterChange<K extends keyof GradeFilters>(
    key: K,
    value: GradeFilters[K],
  ): void {
    this.filters.update((current: GradeFilters): GradeFilters => {
      const next: GradeFilters = { ...current, [key]: value };
      // Cascade: a board change clears a level that isn't under that board.
      if (
        key === 'examinationBoardId' &&
        value &&
        next.educationalLevelId &&
        this.levelOptionsById().get(next.educationalLevelId)
          ?.examinationBoardId !== value
      ) {
        next.educationalLevelId = '';
      }
      return next;
    });
    this.page.set(1);
    this.syncLevelQueryParam(this.filters().educationalLevelId);
  }

  protected clearBoardFilter(): void {
    this.onFilterChange('examinationBoardId', '');
  }

  protected clearLevelFilter(): void {
    this.onFilterChange('educationalLevelId', '');
  }

  protected toggleFilters(): void {
    this.filtersOpen.update((open: boolean): boolean => !open);
  }

  protected closeFilters(): void {
    this.filtersOpen.set(false);
  }

  protected resetFilters(): void {
    this.filters.set({ ...INITIAL_GRADE_FILTERS });
    this.page.set(1);
    this.syncLevelQueryParam('');
  }

  protected onSortChange(key: GradeColumnKey, direction: SortDirection): void {
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

  protected submitCreate(dto: CreateGradeDto): void {
    this.creating.set(true);

    this.store.createGrade(dto, {
      next: (): void => {
        this.creating.set(false);
        this.showCreateForm.set(false);
        this.notificationService.show({
          message: 'Grade created.',
          type: 'success',
        });
      },
      error: (message: string): void => {
        this.creating.set(false);
        this.notificationService.show({ message, type: 'error' });
      },
    });
  }

  protected toggleMenu(gradeId: string): void {
    this.openMenuId.update((current: string | null): string | null =>
      current === gradeId ? null : gradeId,
    );
  }

  protected closeMenu(): void {
    this.openMenuId.set(null);
  }

  private syncLevelQueryParam(levelId: string): void {
    const current: string =
      this.route.snapshot.queryParamMap.get(LEVEL_QUERY_PARAM) ?? '';
    if (current === levelId) {
      return;
    }
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { [LEVEL_QUERY_PARAM]: levelId || null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
