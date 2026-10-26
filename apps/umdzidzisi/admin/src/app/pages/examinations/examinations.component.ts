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
  CreateExaminationDto,
  EducationalLevelResponseDto,
  EducationalLevelsStore,
  EntityStatus,
  ExaminationBoardResponseDto,
  ExaminationBoardsStore,
  ExaminationResponseDto,
  ExaminationsStore,
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
import { CreateExaminationDialogComponent } from './create-examination-dialog/create-examination-dialog.component';
import { ExaminationDetailDrawerComponent } from './examination-detail-drawer/examination-detail-drawer.component';
import { ENTITY_STATUS_OPTIONS } from '../../shared/types/common/entity-status-options.const';
import { ENTITY_STATUS_TONES } from '../../shared/types/common/entity-status-tones.const';
import { SelectOption } from '../../shared/types/common/select-option.type';
import { ExaminationColumnKey } from '../../shared/types/examinations/examination-column-key.type';
import { ExaminationFilters } from '../../shared/types/examinations/examination-filters.type';
import { ExaminationRow } from '../../shared/types/examinations/examination-row.type';
import { INITIAL_EXAMINATION_FILTERS } from '../../shared/types/examinations/initial-examination-filters.const';

const DEFAULT_PAGE_SIZE: number = 10;

@Component({
  selector: 'org-examinations',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    RouterLink,
    OverlayModule,
    CreateExaminationDialogComponent,
    ExaminationDetailDrawerComponent,
    StatusPillComponent,
    TablePaginationComponent,
    SortableColumnHeaderComponent,
    KpiStatCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './examinations.component.html',
})
export class ExaminationsComponent {
  private readonly store: InstanceType<typeof ExaminationsStore> =
    inject(ExaminationsStore);
  private readonly examinationBoardsStore: InstanceType<
    typeof ExaminationBoardsStore
  > = inject(ExaminationBoardsStore);
  private readonly educationalLevelsStore: InstanceType<
    typeof EducationalLevelsStore
  > = inject(EducationalLevelsStore);
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

  protected readonly filters: WritableSignal<ExaminationFilters> = signal({
    ...INITIAL_EXAMINATION_FILTERS,
  });
  protected readonly filtersOpen: WritableSignal<boolean> = signal(false);
  protected readonly sortKey: WritableSignal<ExaminationColumnKey | null> =
    signal(null);
  protected readonly sortDirection: WritableSignal<SortDirection> =
    signal(null);
  protected readonly page: WritableSignal<number> = signal(1);
  protected readonly pageSize: WritableSignal<number> =
    signal(DEFAULT_PAGE_SIZE);

  protected readonly selectedExaminationId: Signal<string | null> = toSignal(
    this.route.paramMap.pipe(map((params: ParamMap) => params.get('id'))),
    { initialValue: null },
  );

  protected readonly examinationsLoading: Signal<boolean> =
    this.store.examinationsLoading;
  protected readonly examinationsError: Signal<string | null> =
    this.store.examinationsError;
  protected readonly examinationBoards: Signal<ExaminationBoardResponseDto[]> =
    this.examinationBoardsStore.examinationBoards;
  protected readonly educationalLevels: Signal<EducationalLevelResponseDto[]> =
    this.educationalLevelsStore.educationalLevels;

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

  private readonly educationalLevelNamesById: Signal<Map<string, string>> =
    computed<Map<string, string>>(
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

  protected readonly rows: Signal<ExaminationRow[]> = computed<
    ExaminationRow[]
  >(() =>
    this.store
      .examinations()
      .map((examination: ExaminationResponseDto): ExaminationRow => ({
        ...examination,
        statusTone: ENTITY_STATUS_TONES[examination.status] ?? 'info',
        examinationBoardName:
          this.examinationBoardNamesById().get(
            examination.examinationBoardId,
          ) ?? examination.examinationBoardId,
        educationalLevelName:
          this.educationalLevelNamesById().get(
            examination.educationalLevelId,
          ) ?? examination.educationalLevelId,
      })),
  );

  protected readonly examinationStats: Signal<KpiCard[]> = computed<KpiCard[]>(
    () => {
      const all: ExaminationRow[] = this.rows();
      const countBy: (status: EntityStatus) => string = (
        status: EntityStatus,
      ): string =>
        String(
          all.filter(
            (examination: ExaminationRow): boolean =>
              examination.status === status,
          ).length,
        );
      return [
        {
          label: 'Total Examinations',
          value: String(all.length),
          icon: 'fi fi-rr-document-signed',
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

  /** Level filter options, narrowed to the board filter when one is set. */
  protected readonly levelFilterOptions: Signal<EducationalLevelResponseDto[]> =
    computed<EducationalLevelResponseDto[]>(() => {
      const examinationBoardId: string = this.filters().examinationBoardId;
      return examinationBoardId
        ? this.educationalLevels().filter(
            (level: EducationalLevelResponseDto): boolean =>
              level.examinationBoardId === examinationBoardId,
          )
        : this.educationalLevels();
    });

  protected readonly filteredExaminationBoardName: Signal<string> =
    computed<string>(() => {
      const examinationBoardId: string = this.filters().examinationBoardId;
      return (
        this.examinationBoardNamesById().get(examinationBoardId) ??
        examinationBoardId
      );
    });

  protected readonly filteredEducationalLevelName: Signal<string> =
    computed<string>(() => {
      const educationalLevelId: string = this.filters().educationalLevelId;
      return (
        this.educationalLevelNamesById().get(educationalLevelId) ??
        educationalLevelId
      );
    });

  protected readonly activeFilterCount: Signal<number> = computed<number>(
    () =>
      Object.values(this.filters()).filter(
        (value: string | null): boolean => value !== '' && value !== null,
      ).length,
  );

  private readonly columnFilters: Signal<ColumnFilter<ExaminationRow>[]> =
    computed<ColumnFilter<ExaminationRow>[]>(() => {
      const current: ExaminationFilters = this.filters();
      return [
        {
          accessor: (examination: ExaminationRow): string => examination.name,
          predicate: containsPredicate,
          value: current.name,
        },
        {
          accessor: (examination: ExaminationRow): string =>
            examination.examinationBoardId,
          predicate: equalsPredicate,
          value: current.examinationBoardId,
        },
        {
          accessor: (examination: ExaminationRow): string =>
            examination.educationalLevelId,
          predicate: equalsPredicate,
          value: current.educationalLevelId,
        },
        {
          accessor: (examination: ExaminationRow): string => examination.status,
          predicate: equalsPredicate,
          value: current.status,
        },
        {
          accessor: (examination: ExaminationRow): Date =>
            new Date(examination.createdAt),
          predicate: dateRangePredicate,
          value: { from: current.createdFrom, to: current.createdTo },
        },
      ];
    });

  protected readonly filteredRows: Signal<ExaminationRow[]> = computed<
    ExaminationRow[]
  >(() => {
    const filtered: ExaminationRow[] = filterRows(
      this.rows(),
      this.columnFilters(),
    );
    return searchRows(filtered, this.globalSearch.query(), [
      (examination: ExaminationRow): string => examination.name,
      (examination: ExaminationRow): string => examination.qualification ?? '',
      (examination: ExaminationRow): string => examination.examinationBoardName,
      (examination: ExaminationRow): string => examination.educationalLevelName,
      (examination: ExaminationRow): string => examination.status,
    ]);
  });

  protected readonly filteredTotal: Signal<number> = computed<number>(
    () => this.filteredRows().length,
  );

  private readonly sortedRows: Signal<ExaminationRow[]> = computed<
    ExaminationRow[]
  >(() => {
    const key: ExaminationColumnKey | null = this.sortKey();
    const accessor: ((examination: ExaminationRow) => unknown) | null = key
      ? (examination: ExaminationRow): unknown =>
          key === 'createdAt'
            ? new Date(examination.createdAt)
            : examination[key]
      : null;
    return sortRows(this.filteredRows(), accessor, this.sortDirection());
  });

  protected readonly pagedRows: Signal<ExaminationRow[]> = computed<
    ExaminationRow[]
  >(() => paginateRows(this.sortedRows(), this.page(), this.pageSize()));

  public constructor() {
    this.store.loadExaminations();
    this.examinationBoardsStore.loadExaminationBoards();
    this.educationalLevelsStore.loadEducationalLevels();

    this.globalSearch.placeholder.set('Search examinations…');
    inject(DestroyRef).onDestroy((): void => {
      this.globalSearch.placeholder.set('Search...');
      this.globalSearch.query.set('');
    });

    effect((): void => {
      this.globalSearch.query();
      this.page.set(1);
    });

    // Parent filters live in the URL so "View examinations →" links land
    // pre-filtered and survive opening/closing a detail drawer.
    this.route.queryParamMap
      .pipe(takeUntilDestroyed())
      .subscribe((params: ParamMap): void => {
        this.filters.update(
          (current: ExaminationFilters): ExaminationFilters => ({
            ...current,
            examinationBoardId: params.get('examinationBoardId') ?? '',
            educationalLevelId: params.get('educationalLevelId') ?? '',
          }),
        );
        this.page.set(1);
      });
  }

  protected onFilterChange<K extends keyof ExaminationFilters>(
    key: K,
    value: ExaminationFilters[K],
  ): void {
    this.filters.update((current: ExaminationFilters): ExaminationFilters => ({
      ...current,
      [key]: value,
      // A level belongs to one board, so a new board clears the level.
      ...(key === 'examinationBoardId' ? { educationalLevelId: '' } : {}),
    }));
    this.page.set(1);
    if (key === 'examinationBoardId' || key === 'educationalLevelId') {
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
    this.filters.set({ ...INITIAL_EXAMINATION_FILTERS });
    this.page.set(1);
    this.syncQueryParams();
  }

  protected onSortChange(
    key: ExaminationColumnKey,
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

  protected submitCreate(dto: CreateExaminationDto): void {
    this.creating.set(true);

    this.store.createExamination(dto, {
      next: (): void => {
        this.creating.set(false);
        this.showCreateForm.set(false);
        this.notificationService.show({
          message: 'Examination created successfully.',
          type: 'success',
        });
      },
      error: (message: string): void => {
        this.creating.set(false);
        this.notificationService.show({ message, type: 'error' });
      },
    });
  }

  protected toggleMenu(examinationId: string): void {
    this.openMenuId.update((current: string | null): string | null =>
      current === examinationId ? null : examinationId,
    );
  }

  protected closeMenu(): void {
    this.openMenuId.set(null);
  }

  /** Mirrors the deep-linkable parent filter into the URL. */
  private syncQueryParams(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        examinationBoardId: this.filters().examinationBoardId || null,
        educationalLevelId: this.filters().educationalLevelId || null,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
