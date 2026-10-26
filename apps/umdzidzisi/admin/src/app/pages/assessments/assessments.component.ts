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
import {
  ActivatedRoute,
  Params,
  ParamMap,
  Router,
  RouterLink,
} from '@angular/router';
import { map } from 'rxjs';
import { OverlayModule } from '@angular/cdk/overlay';
import {
  AssessmentResponseDto,
  AssessmentsStore,
  AssessmentStatus,
  CreateAssessmentDto,
  CreateAssessmentQuestionDto,
  EducationalLevelsStore,
  ExaminationPaperResponseDto,
  ExaminationPapersStore,
  SubjectResponseDto,
  SubjectsStore,
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
import { CreateAssessmentDialogComponent } from './create-assessment-dialog/create-assessment-dialog.component';
import { AssessmentDetailDrawerComponent } from './assessment-detail-drawer/assessment-detail-drawer.component';
import { AssessmentRow } from '../../shared/types/assessments/assessment-row.type';
import { AssessmentColumnKey } from '../../shared/types/assessments/assessment-column-key.type';
import { AssessmentFilters } from '../../shared/types/assessments/assessment-filters.type';
import { AssessmentLookups } from '../../shared/types/assessments/assessment-lookups.type';
import { INITIAL_ASSESSMENT_FILTERS } from '../../shared/types/assessments/initial-assessment-filters.const';
import { SelectOption } from '../../shared/types/common/select-option.type';
import { ASSESSMENT_STATUS_OPTIONS } from '../../shared/types/common/assessment-status-options.const';
import { ASSESSMENT_STATUS_TONES } from '../../shared/types/common/assessment-status-tones.const';

const DEFAULT_PAGE_SIZE: number = 10;

/** Query params that deep-link into a pre-filtered list. */
type DeepLinkFilterKey = 'examinationPaperId' | 'subjectId';
const DEEP_LINK_KEYS: DeepLinkFilterKey[] = ['examinationPaperId', 'subjectId'];

const sumMarks: (questions: CreateAssessmentQuestionDto[]) => number = (
  questions: CreateAssessmentQuestionDto[],
): number =>
  questions.reduce(
    (total: number, question: CreateAssessmentQuestionDto) =>
      total + (question.marks ?? 0),
    0,
  );

@Component({
  selector: 'org-assessments',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    RouterLink,
    OverlayModule,
    CreateAssessmentDialogComponent,
    AssessmentDetailDrawerComponent,
    KpiStatCardComponent,
    SortableColumnHeaderComponent,
    StatusPillComponent,
    TablePaginationComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './assessments.component.html',
})
export class AssessmentsComponent {
  private readonly store: InstanceType<typeof AssessmentsStore> =
    inject(AssessmentsStore);
  private readonly papersStore: InstanceType<typeof ExaminationPapersStore> =
    inject(ExaminationPapersStore);
  private readonly subjectsStore: InstanceType<typeof SubjectsStore> =
    inject(SubjectsStore);
  private readonly levelsStore: InstanceType<typeof EducationalLevelsStore> =
    inject(EducationalLevelsStore);
  private readonly topicsStore: InstanceType<typeof TopicsStore> =
    inject(TopicsStore);
  private readonly subTopicsStore: InstanceType<typeof SubTopicsStore> =
    inject(SubTopicsStore);
  private readonly notificationService: NotificationService =
    inject(NotificationService);
  private readonly globalSearch: GlobalSearchService =
    inject(GlobalSearchService);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);

  protected readonly statusOptions: SelectOption[] = ASSESSMENT_STATUS_OPTIONS;

  protected readonly selectedAssessmentId: Signal<string | null> = toSignal(
    this.route.paramMap.pipe(map((params: ParamMap) => params.get('id'))),
    { initialValue: null },
  );

  private readonly queryParams: Signal<ParamMap> = toSignal(
    this.route.queryParamMap,
    { initialValue: this.route.snapshot.queryParamMap },
  );

  protected readonly assessments: Signal<AssessmentResponseDto[]> =
    this.store.assessments;
  protected readonly assessmentsLoading: Signal<boolean> =
    this.store.assessmentsLoading;
  protected readonly assessmentsError: Signal<string | null> =
    this.store.assessmentsError;

  protected readonly showDialog: WritableSignal<boolean> = signal(false);
  protected readonly saving: WritableSignal<boolean> = signal(false);
  protected readonly openMenuId: WritableSignal<string | null> = signal(null);

  protected readonly filters: WritableSignal<AssessmentFilters> = signal({
    ...INITIAL_ASSESSMENT_FILTERS,
    examinationPaperId:
      this.route.snapshot.queryParamMap.get('examinationPaperId') ?? '',
    subjectId: this.route.snapshot.queryParamMap.get('subjectId') ?? '',
  });
  protected readonly filtersOpen: WritableSignal<boolean> = signal(false);
  protected readonly sortKey: WritableSignal<AssessmentColumnKey | null> =
    signal(null);
  protected readonly sortDirection: WritableSignal<SortDirection> =
    signal(null);
  protected readonly page: WritableSignal<number> = signal(1);
  protected readonly pageSize: WritableSignal<number> =
    signal(DEFAULT_PAGE_SIZE);

  protected readonly lookups: Signal<AssessmentLookups> =
    computed<AssessmentLookups>(() => ({
      papers: this.papersStore.examinationPapers(),
      subjects: this.subjectsStore.subjects(),
      levels: this.levelsStore.educationalLevels(),
      topics: this.topicsStore.topics(),
      subTopics: this.subTopicsStore.subTopics(),
    }));

  private readonly paperNamesById: Signal<Map<string, string>> = computed<
    Map<string, string>
  >(
    () =>
      new Map(
        this.lookups().papers.map(
          (paper: ExaminationPaperResponseDto): [string, string] => [
            paper._id,
            paper.name,
          ],
        ),
      ),
  );

  private readonly subjectNamesById: Signal<Map<string, string>> = computed<
    Map<string, string>
  >(
    () =>
      new Map(
        this.lookups().subjects.map(
          (subject: SubjectResponseDto): [string, string] => [
            subject._id,
            subject.name,
          ],
        ),
      ),
  );

  private readonly topicNamesById: Signal<Map<string, string>> = computed<
    Map<string, string>
  >(
    () =>
      new Map(
        this.lookups().topics.map(
          (topic: TopicResponseDto): [string, string] => [
            topic._id,
            topic.name,
          ],
        ),
      ),
  );

  protected readonly paperOptions: Signal<SelectOption[]> = computed<
    SelectOption[]
  >(() =>
    this.lookups()
      .papers.map((paper: ExaminationPaperResponseDto): SelectOption => ({
        value: paper._id,
        label: `${paper.name} · ${this.subjectNamesById().get(paper.subjectId) ?? paper.subjectId}`,
      }))
      .sort((a: SelectOption, b: SelectOption) =>
        a.label.localeCompare(b.label),
      ),
  );

  protected readonly subjectOptions: Signal<SelectOption[]> = computed<
    SelectOption[]
  >(() =>
    Array.from(this.subjectNamesById().entries())
      .map(([value, label]: [string, string]): SelectOption => ({
        value,
        label,
      }))
      .sort((a: SelectOption, b: SelectOption) =>
        a.label.localeCompare(b.label),
      ),
  );

  protected readonly paperFilterLabel: Signal<string> = computed<string>(() => {
    const paperId: string = this.filters().examinationPaperId;
    return this.paperNamesById().get(paperId) ?? paperId;
  });

  protected readonly subjectFilterLabel: Signal<string> = computed<string>(
    () => {
      const subjectId: string = this.filters().subjectId;
      return this.subjectNamesById().get(subjectId) ?? subjectId;
    },
  );

  protected readonly rows: Signal<AssessmentRow[]> = computed<AssessmentRow[]>(
    () =>
      this.assessments().map(
        (assessment: AssessmentResponseDto): AssessmentRow => ({
          ...assessment,
          statusTone: ASSESSMENT_STATUS_TONES[assessment.status] ?? 'info',
          paperName:
            this.paperNamesById().get(assessment.examinationPaperId) ??
            assessment.examinationPaperId,
          subjectName:
            this.subjectNamesById().get(assessment.subjectId) ??
            assessment.subjectId,
          topicName: assessment.topicId
            ? (this.topicNamesById().get(assessment.topicId) ??
              assessment.topicId)
            : '',
          questionCount: assessment.questions?.length ?? 0,
          totalMarks: sumMarks(assessment.questions ?? []),
        }),
      ),
  );

  protected readonly assessmentStats: Signal<KpiCard[]> = computed<KpiCard[]>(
    () => {
      const all: AssessmentRow[] = this.rows();
      const countOf: (status: AssessmentStatus) => number = (
        status: AssessmentStatus,
      ): number =>
        all.filter((row: AssessmentRow) => row.status === status).length;
      return [
        {
          label: 'Total Assessments',
          value: String(all.length),
          icon: 'fi fi-rr-test',
        },
        {
          label: 'Published',
          value: String(countOf(AssessmentStatus.PUBLISHED)),
          icon: 'fi fi-rr-check-circle',
        },
        {
          label: 'Draft',
          value: String(countOf(AssessmentStatus.DRAFT)),
          icon: 'fi fi-rr-pencil',
        },
        {
          label: 'Archived',
          value: String(countOf(AssessmentStatus.ARCHIVED)),
          icon: 'fi fi-rr-time-past',
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

  private readonly columnFilters: Signal<ColumnFilter<AssessmentRow>[]> =
    computed<ColumnFilter<AssessmentRow>[]>(() => {
      const current: AssessmentFilters = this.filters();
      return [
        {
          accessor: (row: AssessmentRow): string => row.examinationPaperId,
          predicate: equalsPredicate,
          value: current.examinationPaperId,
        },
        {
          accessor: (row: AssessmentRow): string => row.subjectId,
          predicate: equalsPredicate,
          value: current.subjectId,
        },
        {
          accessor: (row: AssessmentRow): string => row.status,
          predicate: equalsPredicate,
          value: current.status,
        },
        {
          accessor: (row: AssessmentRow): Date => new Date(row.createdAt),
          predicate: dateRangePredicate,
          value: { from: current.createdFrom, to: current.createdTo },
        },
      ];
    });

  protected readonly filteredRows: Signal<AssessmentRow[]> = computed<
    AssessmentRow[]
  >(() => {
    const filtered: AssessmentRow[] = filterRows(
      this.rows(),
      this.columnFilters(),
    );
    return searchRows(filtered, this.globalSearch.query(), [
      (row: AssessmentRow): string => row.title,
      (row: AssessmentRow): string => row.paperName,
      (row: AssessmentRow): string => row.subjectName,
      (row: AssessmentRow): string => row.educationalLevel,
      (row: AssessmentRow): string => row.topicName,
      (row: AssessmentRow): string => (row.topicTags ?? []).join(' '),
      (row: AssessmentRow): string => row.status,
    ]);
  });

  protected readonly filteredTotal: Signal<number> = computed<number>(
    () => this.filteredRows().length,
  );

  private readonly sortedRows: Signal<AssessmentRow[]> = computed<
    AssessmentRow[]
  >(() => {
    const key: AssessmentColumnKey | null = this.sortKey();
    const accessor: ((row: AssessmentRow) => unknown) | null = key
      ? (row: AssessmentRow): unknown =>
          key === 'createdAt' ? new Date(row.createdAt) : row[key]
      : null;
    return sortRows(this.filteredRows(), accessor, this.sortDirection());
  });

  protected readonly pagedRows: Signal<AssessmentRow[]> = computed<
    AssessmentRow[]
  >(() => paginateRows(this.sortedRows(), this.page(), this.pageSize()));

  public constructor() {
    this.store.loadAssessments();
    this.papersStore.loadExaminationPapers();
    this.subjectsStore.loadSubjects();
    this.levelsStore.loadEducationalLevels();
    this.topicsStore.loadTopics();
    this.subTopicsStore.loadSubTopics();

    this.globalSearch.placeholder.set('Search assessments…');
    inject(DestroyRef).onDestroy((): void => {
      this.globalSearch.placeholder.set('Search...');
      this.globalSearch.query.set('');
    });

    effect((): void => {
      this.globalSearch.query();
      this.page.set(1);
    });

    // Keep deep-link filters in sync with the query string. The store's
    // load-all already pages through every assessment, so no extra fetch.
    effect((): void => {
      const params: ParamMap = this.queryParams();
      untracked((): void => {
        const current: AssessmentFilters = this.filters();
        const next: AssessmentFilters = { ...current };
        DEEP_LINK_KEYS.forEach((key: DeepLinkFilterKey): void => {
          next[key] = params.get(key) ?? '';
        });
        if (
          DEEP_LINK_KEYS.some(
            (key: DeepLinkFilterKey): boolean => next[key] !== current[key],
          )
        ) {
          this.filters.set(next);
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

  protected submitDialog(dto: CreateAssessmentDto): void {
    this.saving.set(true);

    this.store.createAssessment(dto, {
      next: (created: AssessmentResponseDto): void => {
        this.saving.set(false);
        this.showDialog.set(false);
        this.notificationService.show({
          message: 'Assessment created. Add its questions next.',
          type: 'success',
        });
        // Questions are added in the drawer, so open it straight away.
        this.router.navigate(['.', created._id], {
          relativeTo: this.route,
          queryParamsHandling: 'preserve',
        });
      },
      error: (message: string): void => {
        this.saving.set(false);
        this.notificationService.show({ message, type: 'error' });
      },
    });
  }

  protected onFilterChange<K extends keyof AssessmentFilters>(
    key: K,
    value: AssessmentFilters[K],
  ): void {
    this.filters.update((current: AssessmentFilters): AssessmentFilters => ({
      ...current,
      [key]: value,
    }));
    this.page.set(1);
    if (key === 'examinationPaperId' || key === 'subjectId') {
      this.syncQueryParams({ [key]: (value as string) || null });
    }
  }

  protected toggleFilters(): void {
    this.filtersOpen.update((open: boolean) => !open);
  }

  protected closeFilters(): void {
    this.filtersOpen.set(false);
  }

  protected resetFilters(): void {
    this.filters.set({ ...INITIAL_ASSESSMENT_FILTERS });
    this.page.set(1);
    this.syncQueryParams({ examinationPaperId: null, subjectId: null });
  }

  protected onSortChange(
    key: AssessmentColumnKey,
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

  private syncQueryParams(queryParams: Params): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
