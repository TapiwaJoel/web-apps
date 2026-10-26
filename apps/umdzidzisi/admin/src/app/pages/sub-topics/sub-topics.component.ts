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
  AccessLevel,
  ContentStatus,
  CreateSubTopicDto,
  SubjectResponseDto,
  SubjectsStore,
  SubTopicResponseDto,
  SubTopicsStore,
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
import { CreateSubTopicDialogComponent } from './create-sub-topic-dialog/create-sub-topic-dialog.component';
import { SubTopicDetailDrawerComponent } from './sub-topic-detail-drawer/sub-topic-detail-drawer.component';
import { SubTopicRow } from '../../shared/types/sub-topics/sub-topic-row.type';
import { SubTopicColumnKey } from '../../shared/types/sub-topics/sub-topic-column-key.type';
import { SubTopicFilters } from '../../shared/types/sub-topics/sub-topic-filters.type';
import { INITIAL_SUB_TOPIC_FILTERS } from '../../shared/types/sub-topics/initial-sub-topic-filters.const';
import { ACCESS_LEVEL_TONES } from '../../shared/types/sub-topics/access-level-tones.const';
import { CONTENT_STATUS_OPTIONS } from '../../shared/types/common/content-status-options.const';
import { CONTENT_STATUS_TONES } from '../../shared/types/common/content-status-tones.const';
import { ACCESS_LEVEL_OPTIONS } from '../../shared/types/common/access-level-options.const';
import { SelectOption } from '../../shared/types/common/select-option.type';

const DEFAULT_PAGE_SIZE: number = 10;

@Component({
  selector: 'org-sub-topics',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    RouterLink,
    OverlayModule,
    CreateSubTopicDialogComponent,
    KpiStatCardComponent,
    SortableColumnHeaderComponent,
    StatusPillComponent,
    TablePaginationComponent,
    SubTopicDetailDrawerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sub-topics.component.html',
})
export class SubTopicsComponent {
  // Injected services
  private readonly store: InstanceType<typeof SubTopicsStore> =
    inject(SubTopicsStore);
  private readonly topicsStore: InstanceType<typeof TopicsStore> =
    inject(TopicsStore);
  private readonly subjectsStore: InstanceType<typeof SubjectsStore> =
    inject(SubjectsStore);
  private readonly notificationService: NotificationService =
    inject(NotificationService);
  private readonly globalSearch: GlobalSearchService =
    inject(GlobalSearchService);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);

  // State
  protected readonly statusOptions: SelectOption<ContentStatus>[] =
    CONTENT_STATUS_OPTIONS;
  protected readonly accessLevelOptions: SelectOption<AccessLevel>[] =
    ACCESS_LEVEL_OPTIONS;

  protected readonly selectedSubTopicId: Signal<string | null> = toSignal(
    this.route.paramMap.pipe(map((params: ParamMap) => params.get('id'))),
    { initialValue: null },
  );

  protected readonly subTopics: Signal<SubTopicResponseDto[]> =
    this.store.subTopics;
  protected readonly subTopicsLoading: Signal<boolean> =
    this.store.subTopicsLoading;
  protected readonly subTopicsError: Signal<string | null> =
    this.store.subTopicsError;
  protected readonly topics: Signal<TopicResponseDto[]> =
    this.topicsStore.topics;
  protected readonly subjects: Signal<SubjectResponseDto[]> =
    this.subjectsStore.subjects;

  protected readonly showDialog: WritableSignal<boolean> = signal(false);
  protected readonly saving: WritableSignal<boolean> = signal(false);
  protected readonly openMenuId: WritableSignal<string | null> = signal(null);

  protected readonly filters: WritableSignal<SubTopicFilters> = signal({
    ...INITIAL_SUB_TOPIC_FILTERS,
  });
  protected readonly filtersOpen: WritableSignal<boolean> = signal(false);
  protected readonly sortKey: WritableSignal<SubTopicColumnKey | null> =
    signal(null);
  protected readonly sortDirection: WritableSignal<SortDirection> =
    signal(null);
  protected readonly page: WritableSignal<number> = signal(1);
  protected readonly pageSize: WritableSignal<number> =
    signal(DEFAULT_PAGE_SIZE);

  // Computed signals
  private readonly subjectNamesById: Signal<Map<string, string>> = computed<
    Map<string, string>
  >(
    () =>
      new Map(
        this.subjects().map((subject: SubjectResponseDto): [string, string] => [
          subject._id,
          subject.name,
        ]),
      ),
  );

  /** "Topic · Subject" labels keyed by topic id. */
  protected readonly topicLabelsById: Signal<Map<string, string>> = computed<
    Map<string, string>
  >(
    () =>
      new Map(
        this.topics().map((topic: TopicResponseDto): [string, string] => {
          const subjectName: string | undefined = this.subjectNamesById().get(
            topic.subjectId,
          );
          return [
            topic._id,
            subjectName ? `${topic.name} · ${subjectName}` : topic.name,
          ];
        }),
      ),
  );

  /** Topic options sorted by their "Topic · Subject" label. */
  protected readonly topicOptions: Signal<SelectOption[]> = computed<
    SelectOption[]
  >(() =>
    Array.from(this.topicLabelsById().entries())
      .map(([value, label]: [string, string]): SelectOption => ({
        value,
        label,
      }))
      .sort((a: SelectOption, b: SelectOption): number =>
        a.label.localeCompare(b.label),
      ),
  );

  protected readonly rows: Signal<SubTopicRow[]> = computed<SubTopicRow[]>(
    () => {
      const topicsById: Map<string, TopicResponseDto> = new Map(
        this.topics().map(
          (topic: TopicResponseDto): [string, TopicResponseDto] => [
            topic._id,
            topic,
          ],
        ),
      );
      return this.subTopics().map(
        (subTopic: SubTopicResponseDto): SubTopicRow => {
          const topic: TopicResponseDto | undefined = topicsById.get(
            subTopic.topicId,
          );
          return {
            ...subTopic,
            statusTone: CONTENT_STATUS_TONES[subTopic.status] ?? 'info',
            accessTone: ACCESS_LEVEL_TONES[subTopic.accessLevel] ?? 'info',
            topicName: topic?.name ?? subTopic.topicId,
            subjectName: topic
              ? (this.subjectNamesById().get(topic.subjectId) ??
                topic.subjectId)
              : '',
            topicLabel:
              this.topicLabelsById().get(subTopic.topicId) ?? subTopic.topicId,
            hasArticle: Boolean(subTopic.articleId),
          };
        },
      );
    },
  );

  protected readonly subTopicStats: Signal<KpiCard[]> = computed<KpiCard[]>(
    () => {
      const all: SubTopicRow[] = this.rows();
      const published: number = all.filter(
        (subTopic: SubTopicRow): boolean =>
          subTopic.status === ContentStatus.PUBLISHED,
      ).length;
      const draft: number = all.filter(
        (subTopic: SubTopicRow): boolean =>
          subTopic.status === ContentStatus.DRAFT,
      ).length;
      const paid: number = all.filter(
        (subTopic: SubTopicRow): boolean =>
          subTopic.accessLevel === AccessLevel.PAID,
      ).length;
      return [
        {
          label: 'Total Sub-topics',
          value: String(all.length),
          icon: 'fi fi-rr-list-check',
        },
        {
          label: 'Published',
          value: String(published),
          icon: 'fi fi-rr-check-circle',
        },
        {
          label: 'Draft',
          value: String(draft),
          icon: 'fi fi-rr-pencil',
        },
        {
          label: 'Paid access',
          value: String(paid),
          icon: 'fi fi-rr-lock',
        },
      ];
    },
  );

  protected readonly activeFilterCount: Signal<number> = computed<number>(
    () =>
      Object.values(this.filters()).filter(
        (value: string | null): boolean => value !== '' && value !== null,
      ).length,
  );

  private readonly columnFilters: Signal<ColumnFilter<SubTopicRow>[]> =
    computed<ColumnFilter<SubTopicRow>[]>(() => {
      const current: SubTopicFilters = this.filters();
      return [
        {
          accessor: (subTopic: SubTopicRow): string => subTopic.topicId,
          predicate: equalsPredicate,
          value: current.topicId,
        },
        {
          accessor: (subTopic: SubTopicRow): string => subTopic.status,
          predicate: equalsPredicate,
          value: current.status,
        },
        {
          accessor: (subTopic: SubTopicRow): string => subTopic.accessLevel,
          predicate: equalsPredicate,
          value: current.accessLevel,
        },
        {
          accessor: (subTopic: SubTopicRow): string =>
            subTopic.hasArticle ? 'linked' : 'none',
          predicate: equalsPredicate,
          value: current.article,
        },
        {
          accessor: (subTopic: SubTopicRow): Date =>
            new Date(subTopic.createdAt),
          predicate: dateRangePredicate,
          value: { from: current.createdFrom, to: current.createdTo },
        },
      ];
    });

  protected readonly filteredRows: Signal<SubTopicRow[]> = computed<
    SubTopicRow[]
  >(() => {
    const filtered: SubTopicRow[] = filterRows(
      this.rows(),
      this.columnFilters(),
    );
    return searchRows(filtered, this.globalSearch.query(), [
      (subTopic: SubTopicRow): string => subTopic.name,
      (subTopic: SubTopicRow): string => subTopic.topicName,
      (subTopic: SubTopicRow): string => subTopic.subjectName,
      (subTopic: SubTopicRow): string => subTopic.learningObjectives,
      (subTopic: SubTopicRow): string => subTopic.status,
      (subTopic: SubTopicRow): string => subTopic.accessLevel,
    ]);
  });

  protected readonly filteredTotal: Signal<number> = computed<number>(
    () => this.filteredRows().length,
  );

  private readonly sortedRows: Signal<SubTopicRow[]> = computed<SubTopicRow[]>(
    () => {
      const key: SubTopicColumnKey | null = this.sortKey();
      if (!key) {
        // Default reading order: topic → sub-topic order.
        return [...this.filteredRows()].sort(
          (a: SubTopicRow, b: SubTopicRow): number =>
            a.topicLabel.localeCompare(b.topicLabel) || a.order - b.order,
        );
      }
      const accessor: (subTopic: SubTopicRow) => unknown = (
        subTopic: SubTopicRow,
      ): unknown =>
        key === 'createdAt' ? new Date(subTopic.createdAt) : subTopic[key];
      return sortRows(this.filteredRows(), accessor, this.sortDirection());
    },
  );

  protected readonly pagedRows: Signal<SubTopicRow[]> = computed<SubTopicRow[]>(
    () => paginateRows(this.sortedRows(), this.page(), this.pageSize()),
  );

  public constructor() {
    this.store.loadSubTopics();
    this.topicsStore.loadTopics();
    this.subjectsStore.loadSubjects();

    this.globalSearch.placeholder.set('Search sub-topics…');
    inject(DestroyRef).onDestroy((): void => {
      this.globalSearch.placeholder.set('Search...');
      this.globalSearch.query.set('');
    });

    effect((): void => {
      this.globalSearch.query();
      this.page.set(1);
    });

    // The topic filter lives in the URL so "View sub-topics →" lands
    // pre-filtered and survives opening/closing a detail drawer.
    this.route.queryParamMap
      .pipe(takeUntilDestroyed())
      .subscribe((params: ParamMap): void => {
        this.filters.update((current: SubTopicFilters): SubTopicFilters => ({
          ...current,
          topicId: params.get('topicId') ?? '',
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

  protected submitDialog(dto: CreateSubTopicDto): void {
    this.saving.set(true);

    this.store.createSubTopic(dto, {
      next: (): void => {
        this.saving.set(false);
        this.showDialog.set(false);
        this.notificationService.show({
          message: 'Sub-topic created.',
          type: 'success',
        });
      },
      error: (message: string): void => {
        this.saving.set(false);
        this.notificationService.show({ message, type: 'error' });
      },
    });
  }

  protected onFilterChange<K extends keyof SubTopicFilters>(
    key: K,
    value: SubTopicFilters[K],
  ): void {
    if (key === 'topicId') {
      this.setTopicFilter((value as string) || null);
      return;
    }
    this.filters.update((current: SubTopicFilters): SubTopicFilters => ({
      ...current,
      [key]: value,
    }));
    this.page.set(1);
  }

  protected clearTopicFilter(): void {
    this.setTopicFilter(null);
  }

  protected toggleFilters(): void {
    this.filtersOpen.update((open: boolean): boolean => !open);
  }

  protected closeFilters(): void {
    this.filtersOpen.set(false);
  }

  protected resetFilters(): void {
    this.filters.set({ ...INITIAL_SUB_TOPIC_FILTERS });
    this.setTopicFilter(null);
  }

  protected onSortChange(
    key: SubTopicColumnKey,
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

  // Private methods
  private setTopicFilter(topicId: string | null): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { topicId },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
