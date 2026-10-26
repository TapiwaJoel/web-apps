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
  CreateTopicDto,
  GradeResponseDto,
  GradesStore,
  SubjectResponseDto,
  SubjectsStore,
  TopicResponseDto,
  TopicsStore,
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
import { CreateTopicDialogComponent } from './create-topic-dialog/create-topic-dialog.component';
import { TopicDetailDrawerComponent } from './topic-detail-drawer/topic-detail-drawer.component';
import { TopicRow } from '../../shared/types/topics/topic-row.type';
import { TopicColumnKey } from '../../shared/types/topics/topic-column-key.type';
import { TopicFilters } from '../../shared/types/topics/topic-filters.type';
import { TopicDeepLinkKey } from '../../shared/types/topics/topic-deep-link-key.type';
import { INITIAL_TOPIC_FILTERS } from '../../shared/types/topics/initial-topic-filters.const';
import { CONTENT_STATUS_OPTIONS } from '../../shared/types/common/content-status-options.const';
import { CONTENT_STATUS_TONES } from '../../shared/types/common/content-status-tones.const';
import { SelectOption } from '../../shared/types/common/select-option.type';

const DEFAULT_PAGE_SIZE: number = 10;

/** Stable key for a topic's ordering scope. */
function orderScopeKey(topic: TopicResponseDto): string {
  return `${topic.subjectId}|${topic.gradeId}|${topic.order}`;
}

@Component({
  selector: 'org-topics',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    RouterLink,
    OverlayModule,
    CreateTopicDialogComponent,
    KpiStatCardComponent,
    SortableColumnHeaderComponent,
    StatusPillComponent,
    TablePaginationComponent,
    TopicDetailDrawerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './topics.component.html',
})
export class TopicsComponent {
  // Injected services
  private readonly store: InstanceType<typeof TopicsStore> =
    inject(TopicsStore);
  private readonly subjectsStore: InstanceType<typeof SubjectsStore> =
    inject(SubjectsStore);
  private readonly gradesStore: InstanceType<typeof GradesStore> =
    inject(GradesStore);
  private readonly notificationService: NotificationService =
    inject(NotificationService);
  private readonly globalSearch: GlobalSearchService =
    inject(GlobalSearchService);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);

  // State
  protected readonly statusOptions: SelectOption<ContentStatus>[] =
    CONTENT_STATUS_OPTIONS;

  protected readonly selectedTopicId: Signal<string | null> = toSignal(
    this.route.paramMap.pipe(map((params: ParamMap) => params.get('id'))),
    { initialValue: null },
  );

  protected readonly topics: Signal<TopicResponseDto[]> = this.store.topics;
  protected readonly topicsLoading: Signal<boolean> = this.store.topicsLoading;
  protected readonly topicsError: Signal<string | null> =
    this.store.topicsError;
  protected readonly subjects: Signal<SubjectResponseDto[]> =
    this.subjectsStore.subjects;
  protected readonly grades: Signal<GradeResponseDto[]> =
    this.gradesStore.grades;

  protected readonly showDialog: WritableSignal<boolean> = signal(false);
  protected readonly saving: WritableSignal<boolean> = signal(false);
  protected readonly openMenuId: WritableSignal<string | null> = signal(null);

  protected readonly filters: WritableSignal<TopicFilters> = signal({
    ...INITIAL_TOPIC_FILTERS,
  });
  protected readonly filtersOpen: WritableSignal<boolean> = signal(false);
  protected readonly sortKey: WritableSignal<TopicColumnKey | null> =
    signal(null);
  protected readonly sortDirection: WritableSignal<SortDirection> =
    signal(null);
  protected readonly page: WritableSignal<number> = signal(1);
  protected readonly pageSize: WritableSignal<number> =
    signal(DEFAULT_PAGE_SIZE);

  // Computed signals
  protected readonly subjectsById: Signal<Map<string, SubjectResponseDto>> =
    computed<Map<string, SubjectResponseDto>>(
      () =>
        new Map(
          this.subjects().map(
            (subject: SubjectResponseDto): [string, SubjectResponseDto] => [
              subject._id,
              subject,
            ],
          ),
        ),
    );

  protected readonly gradesById: Signal<Map<string, GradeResponseDto>> =
    computed<Map<string, GradeResponseDto>>(
      () =>
        new Map(
          this.grades().map(
            (grade: GradeResponseDto): [string, GradeResponseDto] => [
              grade._id,
              grade,
            ],
          ),
        ),
    );

  /** Counts per (subject, grade, order) — >1 means a clash. */
  private readonly orderScopeCounts: Signal<Map<string, number>> = computed<
    Map<string, number>
  >(() => {
    const counts: Map<string, number> = new Map();
    this.topics().forEach((topic: TopicResponseDto): void => {
      const key: string = orderScopeKey(topic);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    return counts;
  });

  protected readonly rows: Signal<TopicRow[]> = computed<TopicRow[]>(() =>
    this.topics().map((topic: TopicResponseDto): TopicRow => {
      const grade: GradeResponseDto | undefined = this.gradesById().get(
        topic.gradeId,
      );
      return {
        ...topic,
        statusTone: CONTENT_STATUS_TONES[topic.status] ?? 'info',
        subjectName:
          this.subjectsById().get(topic.subjectId)?.name ?? topic.subjectId,
        gradeName: grade?.name ?? topic.gradeId,
        gradeDisplayOrder: grade?.displayOrder ?? Number.MAX_SAFE_INTEGER,
        duplicateOrder:
          (this.orderScopeCounts().get(orderScopeKey(topic)) ?? 0) > 1,
      };
    }),
  );

  protected readonly topicStats: Signal<KpiCard[]> = computed<KpiCard[]>(() => {
    const all: TopicRow[] = this.rows();
    const countBy: (status: ContentStatus) => number = (
      status: ContentStatus,
    ): number =>
      all.filter((topic: TopicRow): boolean => topic.status === status).length;
    return [
      {
        label: 'Total Topics',
        value: String(all.length),
        icon: 'fi fi-rr-list',
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
  });

  protected readonly duplicateOrderCount: Signal<number> = computed<number>(
    () =>
      this.rows().filter((topic: TopicRow): boolean => topic.duplicateOrder)
        .length,
  );

  /** Grade filter options, narrowed to the chosen subject's level when set. */
  protected readonly gradeFilterOptions: Signal<GradeResponseDto[]> = computed<
    GradeResponseDto[]
  >(() => {
    const levelId: string | undefined = this.subjectsById().get(
      this.filters().subjectId,
    )?.educationalLevelId;
    const grades: GradeResponseDto[] = levelId
      ? this.grades().filter(
          (grade: GradeResponseDto): boolean =>
            grade.educationalLevelId === levelId,
        )
      : this.grades();
    return [...grades].sort(
      (a: GradeResponseDto, b: GradeResponseDto): number =>
        a.displayOrder - b.displayOrder,
    );
  });

  protected readonly activeFilterCount: Signal<number> = computed<number>(
    () =>
      Object.values(this.filters()).filter(
        (value: string | null): boolean => value !== '' && value !== null,
      ).length,
  );

  private readonly columnFilters: Signal<ColumnFilter<TopicRow>[]> = computed<
    ColumnFilter<TopicRow>[]
  >(() => {
    const current: TopicFilters = this.filters();
    return [
      {
        accessor: (topic: TopicRow): string => topic.subjectId,
        predicate: equalsPredicate,
        value: current.subjectId,
      },
      {
        accessor: (topic: TopicRow): string => topic.gradeId,
        predicate: equalsPredicate,
        value: current.gradeId,
      },
      {
        accessor: (topic: TopicRow): string => topic.status,
        predicate: equalsPredicate,
        value: current.status,
      },
      {
        accessor: (topic: TopicRow): Date => new Date(topic.createdAt),
        predicate: dateRangePredicate,
        value: { from: current.createdFrom, to: current.createdTo },
      },
    ];
  });

  protected readonly filteredRows: Signal<TopicRow[]> = computed<TopicRow[]>(
    () => {
      const filtered: TopicRow[] = filterRows(
        this.rows(),
        this.columnFilters(),
      );
      return searchRows(filtered, this.globalSearch.query(), [
        (topic: TopicRow): string => topic.name,
        (topic: TopicRow): string => topic.subjectName,
        (topic: TopicRow): string => topic.gradeName,
        (topic: TopicRow): string => topic.status,
      ]);
    },
  );

  protected readonly filteredTotal: Signal<number> = computed<number>(
    () => this.filteredRows().length,
  );

  private readonly sortedRows: Signal<TopicRow[]> = computed<TopicRow[]>(() => {
    const key: TopicColumnKey | null = this.sortKey();
    if (!key) {
      // Default reading order: subject → grade → topic order.
      return [...this.filteredRows()].sort(
        (a: TopicRow, b: TopicRow): number =>
          a.subjectName.localeCompare(b.subjectName) ||
          a.gradeDisplayOrder - b.gradeDisplayOrder ||
          a.gradeName.localeCompare(b.gradeName) ||
          a.order - b.order,
      );
    }
    const accessor: (topic: TopicRow) => unknown = (
      topic: TopicRow,
    ): unknown =>
      key === 'createdAt'
        ? new Date(topic.createdAt)
        : key === 'gradeName'
          ? topic.gradeDisplayOrder
          : topic[key];
    return sortRows(this.filteredRows(), accessor, this.sortDirection());
  });

  protected readonly pagedRows: Signal<TopicRow[]> = computed<TopicRow[]>(() =>
    paginateRows(this.sortedRows(), this.page(), this.pageSize()),
  );

  public constructor() {
    this.store.loadTopics();
    this.subjectsStore.loadSubjects();
    this.gradesStore.loadGrades();

    this.globalSearch.placeholder.set('Search topics…');
    inject(DestroyRef).onDestroy((): void => {
      this.globalSearch.placeholder.set('Search...');
      this.globalSearch.query.set('');
    });

    effect((): void => {
      this.globalSearch.query();
      this.page.set(1);
    });

    // Parent filters live in the URL so "View topics →" links land
    // pre-filtered and survive opening/closing a detail drawer.
    this.route.queryParamMap
      .pipe(takeUntilDestroyed())
      .subscribe((params: ParamMap): void => {
        this.filters.update((current: TopicFilters): TopicFilters => ({
          ...current,
          subjectId: params.get('subjectId') ?? '',
          gradeId: params.get('gradeId') ?? '',
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

  protected submitDialog(dto: CreateTopicDto): void {
    this.saving.set(true);

    this.store.createTopic(dto, {
      next: (): void => {
        this.saving.set(false);
        this.showDialog.set(false);
        this.notificationService.show({
          message: 'Topic created.',
          type: 'success',
        });
      },
      error: (message: string): void => {
        this.saving.set(false);
        this.notificationService.show({ message, type: 'error' });
      },
    });
  }

  protected onFilterChange<K extends keyof TopicFilters>(
    key: K,
    value: TopicFilters[K],
  ): void {
    if (key === 'subjectId') {
      // A different subject may sit at a different level, so drop the grade.
      this.setDeepLinkFilters({
        subjectId: (value as string) || null,
        gradeId: null,
      });
      return;
    }
    if (key === 'gradeId') {
      this.setDeepLinkFilters({ gradeId: (value as string) || null });
      return;
    }
    this.filters.update((current: TopicFilters): TopicFilters => ({
      ...current,
      [key]: value,
    }));
    this.page.set(1);
  }

  protected clearDeepLinkFilter(key: TopicDeepLinkKey): void {
    this.onFilterChange(key, '');
  }

  protected toggleFilters(): void {
    this.filtersOpen.update((open: boolean): boolean => !open);
  }

  protected closeFilters(): void {
    this.filtersOpen.set(false);
  }

  protected resetFilters(): void {
    this.filters.set({ ...INITIAL_TOPIC_FILTERS });
    this.setDeepLinkFilters({ subjectId: null, gradeId: null });
  }

  protected onSortChange(key: TopicColumnKey, direction: SortDirection): void {
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

  // Private methods
  private setDeepLinkFilters(
    params: Partial<Record<TopicDeepLinkKey, string | null>>,
  ): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
