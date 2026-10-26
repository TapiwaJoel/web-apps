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
  ContentStatus,
  CreateSubjectDto,
  EducationalLevelResponseDto,
  EducationalLevelsStore,
  ExaminationBoardResponseDto,
  ExaminationBoardsStore,
  ResourcesService,
  SubjectResponseDto,
  SubjectsStore,
  SubjectType,
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
import { CreateSubjectDialogComponent } from './create-subject-dialog/create-subject-dialog.component';
import { SubjectDetailDrawerComponent } from './subject-detail-drawer/subject-detail-drawer.component';
import { SubjectRow } from '../../shared/types/subjects/subject-row.type';
import { SubjectColumnKey } from '../../shared/types/subjects/subject-column-key.type';
import { SubjectFilters } from '../../shared/types/subjects/subject-filters.type';
import { SubjectDeepLinkKey } from '../../shared/types/subjects/subject-deep-link-key.type';
import { INITIAL_SUBJECT_FILTERS } from '../../shared/types/subjects/initial-subject-filters.const';
import { CONTENT_STATUS_OPTIONS } from '../../shared/types/common/content-status-options.const';
import { CONTENT_STATUS_TONES } from '../../shared/types/common/content-status-tones.const';
import { SUBJECT_TYPE_OPTIONS } from '../../shared/types/common/subject-type-options.const';
import { SelectOption } from '../../shared/types/common/select-option.type';

const DEFAULT_PAGE_SIZE: number = 10;

@Component({
  selector: 'org-subjects',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    RouterLink,
    OverlayModule,
    CreateSubjectDialogComponent,
    KpiStatCardComponent,
    SortableColumnHeaderComponent,
    StatusPillComponent,
    TablePaginationComponent,
    SubjectDetailDrawerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './subjects.component.html',
})
export class SubjectsComponent {
  // Injected services
  private readonly store: InstanceType<typeof SubjectsStore> =
    inject(SubjectsStore);
  private readonly educationalLevelsStore: InstanceType<
    typeof EducationalLevelsStore
  > = inject(EducationalLevelsStore);
  private readonly examinationBoardsStore: InstanceType<
    typeof ExaminationBoardsStore
  > = inject(ExaminationBoardsStore);
  private readonly resourcesService: ResourcesService =
    inject(ResourcesService);
  private readonly notificationService: NotificationService =
    inject(NotificationService);
  private readonly globalSearch: GlobalSearchService =
    inject(GlobalSearchService);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);

  // State
  protected readonly statusOptions: SelectOption<ContentStatus>[] =
    CONTENT_STATUS_OPTIONS;
  protected readonly subjectTypeOptions: SelectOption<SubjectType>[] =
    SUBJECT_TYPE_OPTIONS;

  protected readonly selectedSubjectId: Signal<string | null> = toSignal(
    this.route.paramMap.pipe(map((params: ParamMap) => params.get('id'))),
    { initialValue: null },
  );

  protected readonly subjects: Signal<SubjectResponseDto[]> =
    this.store.subjects;
  protected readonly subjectsLoading: Signal<boolean> =
    this.store.subjectsLoading;
  protected readonly subjectsError: Signal<string | null> =
    this.store.subjectsError;
  protected readonly examinationBoards: Signal<ExaminationBoardResponseDto[]> =
    this.examinationBoardsStore.examinationBoards;
  protected readonly educationalLevels: Signal<EducationalLevelResponseDto[]> =
    this.educationalLevelsStore.educationalLevels;

  protected readonly showDialog: WritableSignal<boolean> = signal(false);
  protected readonly saving: WritableSignal<boolean> = signal(false);
  protected readonly openMenuId: WritableSignal<string | null> = signal(null);

  protected readonly filters: WritableSignal<SubjectFilters> = signal({
    ...INITIAL_SUBJECT_FILTERS,
  });
  protected readonly filtersOpen: WritableSignal<boolean> = signal(false);
  protected readonly sortKey: WritableSignal<SubjectColumnKey | null> =
    signal(null);
  protected readonly sortDirection: WritableSignal<SortDirection> =
    signal(null);
  protected readonly page: WritableSignal<number> = signal(1);
  protected readonly pageSize: WritableSignal<number> =
    signal(DEFAULT_PAGE_SIZE);

  // Computed signals
  protected readonly boardNamesById: Signal<Map<string, string>> = computed<
    Map<string, string>
  >(
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

  protected readonly levelNamesById: Signal<Map<string, string>> = computed<
    Map<string, string>
  >(
    () =>
      new Map(
        this.educationalLevels().map(
          (level: EducationalLevelResponseDto): [string, string] => [
            level._id,
            level.name,
          ],
        ),
      ),
  );

  private readonly subjectTypeLabels: Signal<Map<string, string>> = computed<
    Map<string, string>
  >(
    () =>
      new Map(
        SUBJECT_TYPE_OPTIONS.map(
          (option: SelectOption<SubjectType>): [string, string] => [
            option.value,
            option.label,
          ],
        ),
      ),
  );

  protected readonly rows: Signal<SubjectRow[]> = computed<SubjectRow[]>(() =>
    this.subjects().map((subject: SubjectResponseDto): SubjectRow => ({
      ...subject,
      statusTone: CONTENT_STATUS_TONES[subject.status] ?? 'info',
      examinationBoardName:
        this.boardNamesById().get(subject.examinationBoardId) ??
        subject.examinationBoardId,
      educationalLevelName:
        this.levelNamesById().get(subject.educationalLevelId) ??
        subject.educationalLevelId,
      subjectTypeLabel:
        this.subjectTypeLabels().get(subject.subjectType) ??
        subject.subjectType,
      imageUrl: subject.image
        ? this.resourcesService.contentUrl(subject.image)
        : null,
    })),
  );

  protected readonly subjectStats: Signal<KpiCard[]> = computed<KpiCard[]>(
    () => {
      const all: SubjectRow[] = this.rows();
      const countBy: (status: ContentStatus) => number = (
        status: ContentStatus,
      ): number =>
        all.filter((subject: SubjectRow): boolean => subject.status === status)
          .length;
      return [
        {
          label: 'Total Subjects',
          value: String(all.length),
          icon: 'fi fi-rr-book-alt',
        },
        {
          label: 'Published',
          value: String(countBy(ContentStatus.PUBLISHED)),
          icon: 'fi fi-rr-check-circle',
        },
        {
          label: 'Draft',
          value: String(countBy(ContentStatus.DRAFT)),
          icon: 'fi fi-rr-pencil',
        },
        {
          label: 'Archived',
          value: String(countBy(ContentStatus.ARCHIVED)),
          icon: 'fi fi-rr-box',
        },
      ];
    },
  );

  /** Level filter options, narrowed to the chosen board when one is set. */
  protected readonly levelFilterOptions: Signal<EducationalLevelResponseDto[]> =
    computed<EducationalLevelResponseDto[]>(() => {
      const boardId: string = this.filters().examinationBoardId;
      return boardId
        ? this.educationalLevels().filter(
            (level: EducationalLevelResponseDto): boolean =>
              level.examinationBoardId === boardId,
          )
        : this.educationalLevels();
    });

  protected readonly activeFilterCount: Signal<number> = computed<number>(
    () =>
      Object.values(this.filters()).filter(
        (value: string | null): boolean => value !== '' && value !== null,
      ).length,
  );

  private readonly columnFilters: Signal<ColumnFilter<SubjectRow>[]> = computed<
    ColumnFilter<SubjectRow>[]
  >(() => {
    const current: SubjectFilters = this.filters();
    return [
      {
        accessor: (subject: SubjectRow): string => subject.examinationBoardId,
        predicate: equalsPredicate,
        value: current.examinationBoardId,
      },
      {
        accessor: (subject: SubjectRow): string => subject.educationalLevelId,
        predicate: equalsPredicate,
        value: current.educationalLevelId,
      },
      {
        accessor: (subject: SubjectRow): string => subject.subjectType,
        predicate: equalsPredicate,
        value: current.subjectType,
      },
      {
        accessor: (subject: SubjectRow): string => subject.status,
        predicate: equalsPredicate,
        value: current.status,
      },
      {
        accessor: (subject: SubjectRow): Date => new Date(subject.createdAt),
        predicate: dateRangePredicate,
        value: { from: current.createdFrom, to: current.createdTo },
      },
    ];
  });

  protected readonly filteredRows: Signal<SubjectRow[]> = computed<
    SubjectRow[]
  >(() => {
    const filtered: SubjectRow[] = filterRows(
      this.rows(),
      this.columnFilters(),
    );
    return searchRows(filtered, this.globalSearch.query(), [
      (subject: SubjectRow): string => subject.name,
      (subject: SubjectRow): string => subject.code,
      (subject: SubjectRow): string => subject.examinationBoardName,
      (subject: SubjectRow): string => subject.educationalLevelName,
      (subject: SubjectRow): string => subject.subjectTypeLabel,
      (subject: SubjectRow): string => subject.status,
    ]);
  });

  protected readonly filteredTotal: Signal<number> = computed<number>(
    () => this.filteredRows().length,
  );

  private readonly sortedRows: Signal<SubjectRow[]> = computed<SubjectRow[]>(
    () => {
      const key: SubjectColumnKey | null = this.sortKey();
      if (!key) {
        return [...this.filteredRows()].sort(
          (a: SubjectRow, b: SubjectRow): number =>
            a.name.localeCompare(b.name),
        );
      }
      const accessor: (subject: SubjectRow) => unknown = (
        subject: SubjectRow,
      ): unknown =>
        key === 'createdAt' ? new Date(subject.createdAt) : subject[key];
      return sortRows(this.filteredRows(), accessor, this.sortDirection());
    },
  );

  protected readonly pagedRows: Signal<SubjectRow[]> = computed<SubjectRow[]>(
    () => paginateRows(this.sortedRows(), this.page(), this.pageSize()),
  );

  public constructor() {
    this.store.loadSubjects();
    this.educationalLevelsStore.loadEducationalLevels();
    this.examinationBoardsStore.loadExaminationBoards();

    this.globalSearch.placeholder.set('Search subjects…');
    inject(DestroyRef).onDestroy((): void => {
      this.globalSearch.placeholder.set('Search...');
      this.globalSearch.query.set('');
    });

    effect((): void => {
      this.globalSearch.query();
      this.page.set(1);
    });

    // Parent filters live in the URL so drawer links ("View subjects →")
    // land pre-filtered and survive opening/closing a detail drawer.
    this.route.queryParamMap
      .pipe(takeUntilDestroyed())
      .subscribe((params: ParamMap): void => {
        this.filters.update((current: SubjectFilters): SubjectFilters => ({
          ...current,
          examinationBoardId: params.get('examinationBoardId') ?? '',
          educationalLevelId: params.get('educationalLevelId') ?? '',
        }));
        this.page.set(1);
      });
  }

  // Public methods
  protected openCreateForm(): void {
    this.showDialog.set(true);
  }

  protected cancelDialog(): void {
    this.showDialog.set(false);
  }

  protected submitDialog(dto: CreateSubjectDto): void {
    this.saving.set(true);

    this.store.createSubject(dto, {
      next: (): void => {
        this.saving.set(false);
        this.showDialog.set(false);
        this.notificationService.show({
          message: 'Subject created.',
          type: 'success',
        });
      },
      error: (message: string): void => {
        this.saving.set(false);
        this.notificationService.show({ message, type: 'error' });
      },
    });
  }

  protected onFilterChange<K extends keyof SubjectFilters>(
    key: K,
    value: SubjectFilters[K],
  ): void {
    if (key === 'examinationBoardId') {
      // Changing the board invalidates the chosen level.
      this.setDeepLinkFilters({
        examinationBoardId: (value as string) || null,
        educationalLevelId: null,
      });
      return;
    }
    if (key === 'educationalLevelId') {
      this.setDeepLinkFilters({
        educationalLevelId: (value as string) || null,
      });
      return;
    }
    this.filters.update((current: SubjectFilters): SubjectFilters => ({
      ...current,
      [key]: value,
    }));
    this.page.set(1);
  }

  protected clearDeepLinkFilter(key: SubjectDeepLinkKey): void {
    this.onFilterChange(key, '');
  }

  protected toggleFilters(): void {
    this.filtersOpen.update((open: boolean): boolean => !open);
  }

  protected closeFilters(): void {
    this.filtersOpen.set(false);
  }

  protected resetFilters(): void {
    this.filters.set({ ...INITIAL_SUBJECT_FILTERS });
    this.setDeepLinkFilters({
      examinationBoardId: null,
      educationalLevelId: null,
    });
  }

  protected onSortChange(
    key: SubjectColumnKey,
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
    this.openMenuId.update((current: string | null): string | null =>
      current === id ? null : id,
    );
  }

  protected closeMenu(): void {
    this.openMenuId.set(null);
  }

  protected hideBrokenImage(event: Event): void {
    (event.target as HTMLImageElement).style.visibility = 'hidden';
  }

  // Private methods
  private setDeepLinkFilters(
    params: Partial<Record<SubjectDeepLinkKey, string | null>>,
  ): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
