import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  Signal,
  signal,
  untracked,
  WritableSignal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { OverlayModule } from '@angular/cdk/overlay';
import {
  CreateExaminationPaperDto,
  EducationalLevelsStore,
  EntityStatus,
  ExaminationPaperResponseDto,
  ExaminationPapersStore,
  SubjectsStore,
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
  KpiCard,
  KpiStatCardComponent,
  NotificationService,
  SortableColumnHeaderComponent,
  StatusPillComponent,
  TablePaginationComponent,
} from '@mushaviri/ui';
import { CreateExaminationPaperDialogComponent } from './create-examination-paper-dialog/create-examination-paper-dialog.component';
import { ExaminationPaperDetailDrawerComponent } from './examination-paper-detail-drawer/examination-paper-detail-drawer.component';
import { ExaminationPaperRow } from '../../shared/types/examination-papers/examination-paper-row.type';
import { ExaminationPaperColumnKey } from '../../shared/types/examination-papers/examination-paper-column-key.type';
import { ExaminationPaperFilters } from '../../shared/types/examination-papers/examination-paper-filters.type';
import { INITIAL_EXAMINATION_PAPER_FILTERS } from '../../shared/types/examination-papers/initial-examination-paper-filters.const';
import { buildSubjectLevelLabels } from '../../shared/types/examination-papers/build-subject-level-labels.const';
import { SelectOption } from '../../shared/types/common/select-option.type';
import { ENTITY_STATUS_OPTIONS } from '../../shared/types/common/entity-status-options.const';
import { ENTITY_STATUS_TONES } from '../../shared/types/common/entity-status-tones.const';
import { EXAMINATION_PAPER_TYPE_OPTIONS } from '../../shared/types/common/examination-paper-type-options.const';

const DEFAULT_PAGE_SIZE: number = 10;

@Component({
  selector: 'org-examination-papers',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    RouterLink,
    OverlayModule,
    CreateExaminationPaperDialogComponent,
    ExaminationPaperDetailDrawerComponent,
    KpiStatCardComponent,
    SortableColumnHeaderComponent,
    StatusPillComponent,
    TablePaginationComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './examination-papers.component.html',
})
export class ExaminationPapersComponent {
  private readonly store: InstanceType<typeof ExaminationPapersStore> = inject(
    ExaminationPapersStore,
  );
  private readonly subjectsStore: InstanceType<typeof SubjectsStore> =
    inject(SubjectsStore);
  private readonly levelsStore: InstanceType<typeof EducationalLevelsStore> =
    inject(EducationalLevelsStore);
  private readonly notificationService: NotificationService =
    inject(NotificationService);
  private readonly globalSearch: GlobalSearchService =
    inject(GlobalSearchService);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);

  protected readonly typeOptions: SelectOption[] =
    EXAMINATION_PAPER_TYPE_OPTIONS;
  protected readonly statusOptions: SelectOption[] = ENTITY_STATUS_OPTIONS;

  protected readonly selectedPaperId: Signal<string | null> = toSignal(
    this.route.paramMap.pipe(map((params: ParamMap) => params.get('id'))),
    { initialValue: null },
  );

  private readonly queryParams: Signal<ParamMap> = toSignal(
    this.route.queryParamMap,
    { initialValue: this.route.snapshot.queryParamMap },
  );

  protected readonly papers: Signal<ExaminationPaperResponseDto[]> =
    this.store.examinationPapers;
  protected readonly papersLoading: Signal<boolean> =
    this.store.examinationPapersLoading;
  protected readonly papersError: Signal<string | null> =
    this.store.examinationPapersError;

  protected readonly showDialog: WritableSignal<boolean> = signal(false);
  protected readonly saving: WritableSignal<boolean> = signal(false);
  protected readonly openMenuId: WritableSignal<string | null> = signal(null);

  protected readonly filters: WritableSignal<ExaminationPaperFilters> = signal({
    ...INITIAL_EXAMINATION_PAPER_FILTERS,
    subjectId: this.route.snapshot.queryParamMap.get('subjectId') ?? '',
  });
  protected readonly filtersOpen: WritableSignal<boolean> = signal(false);
  protected readonly sortKey: WritableSignal<ExaminationPaperColumnKey | null> =
    signal(null);
  protected readonly sortDirection: WritableSignal<SortDirection> =
    signal(null);
  protected readonly page: WritableSignal<number> = signal(1);
  protected readonly pageSize: WritableSignal<number> =
    signal(DEFAULT_PAGE_SIZE);

  private readonly subjectLabelsById: Signal<Map<string, string>> = computed<
    Map<string, string>
  >(() =>
    buildSubjectLevelLabels(
      this.subjectsStore.subjects(),
      this.levelsStore.educationalLevels(),
    ),
  );

  /** Every subject as "Subject · Level", for the filter and create selects. */
  protected readonly subjectOptions: Signal<SelectOption[]> = computed<
    SelectOption[]
  >(() =>
    Array.from(this.subjectLabelsById().entries())
      .map(([value, label]: [string, string]): SelectOption => ({
        value,
        label,
      }))
      .sort((a: SelectOption, b: SelectOption) =>
        a.label.localeCompare(b.label),
      ),
  );

  protected readonly subjectFilterLabel: Signal<string> = computed<string>(
    () => {
      const subjectId: string = this.filters().subjectId;
      return this.subjectLabelsById().get(subjectId) ?? subjectId;
    },
  );

  protected readonly rows: Signal<ExaminationPaperRow[]> = computed<
    ExaminationPaperRow[]
  >(() =>
    this.papers().map(
      (paper: ExaminationPaperResponseDto): ExaminationPaperRow => ({
        ...paper,
        statusTone: ENTITY_STATUS_TONES[paper.status] ?? 'info',
        subjectLabel:
          this.subjectLabelsById().get(paper.subjectId) ?? paper.subjectId,
      }),
    ),
  );

  protected readonly paperStats: Signal<KpiCard[]> = computed<KpiCard[]>(() => {
    const all: ExaminationPaperRow[] = this.rows();
    const countOf: (status: EntityStatus) => number = (
      status: EntityStatus,
    ): number =>
      all.filter((paper: ExaminationPaperRow) => paper.status === status)
        .length;
    return [
      {
        label: 'Total Papers',
        value: String(all.length),
        icon: 'fi fi-rr-document',
      },
      {
        label: 'Active',
        value: String(countOf(EntityStatus.ACTIVE)),
        icon: 'fi fi-rr-check-circle',
      },
      {
        label: 'Inactive',
        value: String(countOf(EntityStatus.INACTIVE)),
        icon: 'fi fi-rr-pause-circle',
      },
      {
        label: 'Deleted',
        value: String(countOf(EntityStatus.DELETED)),
        icon: 'fi fi-rr-trash',
      },
    ];
  });

  protected readonly activeFilterCount: Signal<number> = computed<number>(
    () =>
      Object.values(this.filters()).filter(
        (value: string | null): boolean => value !== '' && value !== null,
      ).length,
  );

  private readonly columnFilters: Signal<ColumnFilter<ExaminationPaperRow>[]> =
    computed<ColumnFilter<ExaminationPaperRow>[]>(() => {
      const current: ExaminationPaperFilters = this.filters();
      return [
        {
          accessor: (paper: ExaminationPaperRow): string => paper.subjectId,
          predicate: equalsPredicate,
          value: current.subjectId,
        },
        {
          accessor: (paper: ExaminationPaperRow): string => paper.type,
          predicate: equalsPredicate,
          value: current.type,
        },
        {
          accessor: (paper: ExaminationPaperRow): string => paper.status,
          predicate: equalsPredicate,
          value: current.status,
        },
        {
          accessor: (paper: ExaminationPaperRow): Date =>
            new Date(paper.createdAt),
          predicate: dateRangePredicate,
          value: { from: current.createdFrom, to: current.createdTo },
        },
      ];
    });

  protected readonly filteredRows: Signal<ExaminationPaperRow[]> = computed<
    ExaminationPaperRow[]
  >(() => {
    const filtered: ExaminationPaperRow[] = filterRows(
      this.rows(),
      this.columnFilters(),
    );
    return searchRows(filtered, this.globalSearch.query(), [
      (paper: ExaminationPaperRow): string => paper.name,
      (paper: ExaminationPaperRow): string => paper.subjectLabel,
      (paper: ExaminationPaperRow): string => paper.type,
      (paper: ExaminationPaperRow): string => paper.status,
    ]);
  });

  protected readonly filteredTotal: Signal<number> = computed<number>(
    () => this.filteredRows().length,
  );

  private readonly sortedRows: Signal<ExaminationPaperRow[]> = computed<
    ExaminationPaperRow[]
  >(() => {
    const key: ExaminationPaperColumnKey | null = this.sortKey();
    const accessor: ((paper: ExaminationPaperRow) => unknown) | null = key
      ? (paper: ExaminationPaperRow): unknown =>
          key === 'createdAt' ? new Date(paper.createdAt) : paper[key]
      : null;
    return sortRows(this.filteredRows(), accessor, this.sortDirection());
  });

  protected readonly pagedRows: Signal<ExaminationPaperRow[]> = computed<
    ExaminationPaperRow[]
  >(() => paginateRows(this.sortedRows(), this.page(), this.pageSize()));

  public constructor() {
    this.store.loadExaminationPapers();
    this.subjectsStore.loadSubjects();
    this.levelsStore.loadEducationalLevels();

    this.globalSearch.placeholder.set('Search examination papers…');
    inject(DestroyRef).onDestroy((): void => {
      this.globalSearch.placeholder.set('Search...');
      this.globalSearch.query.set('');
    });

    effect((): void => {
      this.globalSearch.query();
      this.page.set(1);
    });

    // Keep the deep-link filter in sync when only the query string changes.
    effect((): void => {
      const subjectId: string = this.queryParams().get('subjectId') ?? '';
      untracked((): void => {
        if (this.filters().subjectId !== subjectId) {
          this.filters.update(
            (current: ExaminationPaperFilters): ExaminationPaperFilters => ({
              ...current,
              subjectId,
            }),
          );
          this.page.set(1);
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

  protected submitDialog(dto: CreateExaminationPaperDto): void {
    this.saving.set(true);

    this.store.createExaminationPaper(dto, {
      next: (): void => {
        this.saving.set(false);
        this.showDialog.set(false);
        this.notificationService.show({
          message: 'Examination paper created.',
          type: 'success',
        });
      },
      error: (message: string): void => {
        this.saving.set(false);
        this.notificationService.show({ message, type: 'error' });
      },
    });
  }

  protected onFilterChange<K extends keyof ExaminationPaperFilters>(
    key: K,
    value: ExaminationPaperFilters[K],
  ): void {
    this.filters.update(
      (current: ExaminationPaperFilters): ExaminationPaperFilters => ({
        ...current,
        [key]: value,
      }),
    );
    this.page.set(1);
    if (key === 'subjectId') {
      this.syncSubjectQueryParam(value as string);
    }
  }

  protected clearSubjectFilter(): void {
    this.onFilterChange('subjectId', '');
  }

  protected toggleFilters(): void {
    this.filtersOpen.update((open: boolean) => !open);
  }

  protected closeFilters(): void {
    this.filtersOpen.set(false);
  }

  protected resetFilters(): void {
    this.filters.set({ ...INITIAL_EXAMINATION_PAPER_FILTERS });
    this.page.set(1);
    this.syncSubjectQueryParam('');
  }

  protected onSortChange(
    key: ExaminationPaperColumnKey,
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

  private syncSubjectQueryParam(subjectId: string): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { subjectId: subjectId || null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
