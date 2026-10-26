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
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { OverlayModule } from '@angular/cdk/overlay';
import {
  CountryStatus,
  CreateExaminationBoardDto,
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
import { CreateExaminationBoardDialogComponent } from './create-examination-board-dialog/create-examination-board-dialog.component';
import { ExaminationBoardDetailDrawerComponent } from './examination-board-detail-drawer/examination-board-detail-drawer.component';
import { COUNTRY_OPTIONS } from '../../shared/types/common/country-options.const';
import { COUNTRY_STATUS_OPTIONS } from '../../shared/types/common/country-status-options.const';
import { COUNTRY_STATUS_TONES } from '../../shared/types/common/country-status-tones.const';
import { SelectOption } from '../../shared/types/common/select-option.type';
import { ExaminationBoardColumnKey } from '../../shared/types/examination-boards/examination-board-column-key.type';
import { ExaminationBoardFilters } from '../../shared/types/examination-boards/examination-board-filters.type';
import { ExaminationBoardRow } from '../../shared/types/examination-boards/examination-board-row.type';
import { INITIAL_EXAMINATION_BOARD_FILTERS } from '../../shared/types/examination-boards/initial-examination-board-filters.const';

const DEFAULT_PAGE_SIZE: number = 10;

@Component({
  selector: 'org-examination-boards',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    RouterLink,
    OverlayModule,
    CreateExaminationBoardDialogComponent,
    ExaminationBoardDetailDrawerComponent,
    StatusPillComponent,
    TablePaginationComponent,
    SortableColumnHeaderComponent,
    KpiStatCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './examination-boards.component.html',
})
export class ExaminationBoardsComponent {
  protected readonly statusOptions: SelectOption<CountryStatus>[] =
    COUNTRY_STATUS_OPTIONS;

  private readonly store: InstanceType<typeof ExaminationBoardsStore> = inject(
    ExaminationBoardsStore,
  );
  private readonly notificationService: NotificationService =
    inject(NotificationService);
  private readonly globalSearch: GlobalSearchService =
    inject(GlobalSearchService);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);

  protected readonly selectedExaminationBoardId: Signal<string | null> =
    toSignal(
      this.route.paramMap.pipe(map((params: ParamMap) => params.get('id'))),
      { initialValue: null },
    );

  protected readonly examinationBoards: Signal<ExaminationBoardResponseDto[]> =
    this.store.examinationBoards;
  protected readonly examinationBoardsLoading: Signal<boolean> =
    this.store.examinationBoardsLoading;
  protected readonly examinationBoardsError: Signal<string | null> =
    this.store.examinationBoardsError;

  protected readonly showCreateForm: WritableSignal<boolean> = signal(false);
  protected readonly creating: WritableSignal<boolean> = signal(false);
  protected readonly openMenuId: WritableSignal<string | null> = signal(null);

  protected readonly filters: WritableSignal<ExaminationBoardFilters> = signal({
    ...INITIAL_EXAMINATION_BOARD_FILTERS,
  });
  protected readonly filtersOpen: WritableSignal<boolean> = signal(false);
  protected readonly sortKey: WritableSignal<ExaminationBoardColumnKey | null> =
    signal(null);
  protected readonly sortDirection: WritableSignal<SortDirection> =
    signal(null);
  protected readonly page: WritableSignal<number> = signal(1);
  protected readonly pageSize: WritableSignal<number> =
    signal(DEFAULT_PAGE_SIZE);

  private readonly countryLabelsByCode: Map<string, string> = new Map(
    COUNTRY_OPTIONS.map((option: SelectOption): [string, string] => [
      option.value,
      option.label,
    ]),
  );

  protected readonly rows: Signal<ExaminationBoardRow[]> = computed<
    ExaminationBoardRow[]
  >(() =>
    this.examinationBoards().map(
      (board: ExaminationBoardResponseDto): ExaminationBoardRow => ({
        ...board,
        statusTone: COUNTRY_STATUS_TONES[board.status] ?? 'info',
        countryLabel:
          this.countryLabelsByCode.get(board.country) ?? board.country,
      }),
    ),
  );

  protected readonly examinationBoardStats: Signal<KpiCard[]> = computed<
    KpiCard[]
  >(() => {
    const all: ExaminationBoardRow[] = this.rows();
    const countries: Set<string> = new Set(
      all.map((board: ExaminationBoardRow): string => board.country),
    );
    return [
      {
        label: 'Total Boards',
        value: String(all.length),
        icon: 'fi fi-rr-diploma',
      },
      {
        label: 'Active',
        value: String(
          all.filter(
            (board: ExaminationBoardRow): boolean =>
              board.status === CountryStatus.ACTIVE,
          ).length,
        ),
        icon: 'fi fi-rr-check-circle',
      },
      {
        label: 'Inactive',
        value: String(
          all.filter(
            (board: ExaminationBoardRow): boolean =>
              board.status === CountryStatus.INACTIVE,
          ).length,
        ),
        icon: 'fi fi-rr-ban',
      },
      {
        label: 'Countries',
        value: String(countries.size),
        icon: 'fi fi-rr-globe',
      },
    ];
  });

  /** Only the countries that at least one board uses. */
  protected readonly usedCountryOptions: Signal<SelectOption[]> = computed<
    SelectOption[]
  >(() => {
    const used: Set<string> = new Set(
      this.rows().map((board: ExaminationBoardRow): string => board.country),
    );
    return Array.from(used)
      .map((code: string): SelectOption => ({
        value: code,
        label: this.countryLabelsByCode.get(code) ?? code,
      }))
      .sort((a: SelectOption, b: SelectOption): number =>
        a.label.localeCompare(b.label),
      );
  });

  protected readonly activeFilterCount: Signal<number> = computed<number>(
    () =>
      Object.values(this.filters()).filter(
        (value: string | null): boolean => value !== '' && value !== null,
      ).length,
  );

  private readonly columnFilters: Signal<ColumnFilter<ExaminationBoardRow>[]> =
    computed<ColumnFilter<ExaminationBoardRow>[]>(() => {
      const current: ExaminationBoardFilters = this.filters();
      return [
        {
          accessor: (board: ExaminationBoardRow): string => board.name,
          predicate: containsPredicate,
          value: current.name,
        },
        {
          accessor: (board: ExaminationBoardRow): string => board.country,
          predicate: equalsPredicate,
          value: current.country,
        },
        {
          accessor: (board: ExaminationBoardRow): string => board.status,
          predicate: equalsPredicate,
          value: current.status,
        },
        {
          accessor: (board: ExaminationBoardRow): Date =>
            new Date(board.createdAt),
          predicate: dateRangePredicate,
          value: { from: current.createdFrom, to: current.createdTo },
        },
      ];
    });

  protected readonly filteredRows: Signal<ExaminationBoardRow[]> = computed<
    ExaminationBoardRow[]
  >(() => {
    const filtered: ExaminationBoardRow[] = filterRows(
      this.rows(),
      this.columnFilters(),
    );
    return searchRows(filtered, this.globalSearch.query(), [
      (board: ExaminationBoardRow): string => board.name,
      (board: ExaminationBoardRow): string => board.countryLabel,
      (board: ExaminationBoardRow): string => board.description ?? '',
      (board: ExaminationBoardRow): string => board.website ?? '',
      (board: ExaminationBoardRow): string => board.status,
    ]);
  });

  protected readonly filteredTotal: Signal<number> = computed<number>(
    () => this.filteredRows().length,
  );

  private readonly sortedRows: Signal<ExaminationBoardRow[]> = computed<
    ExaminationBoardRow[]
  >(() => {
    const key: ExaminationBoardColumnKey | null = this.sortKey();
    const accessor: ((board: ExaminationBoardRow) => unknown) | null = key
      ? (board: ExaminationBoardRow): unknown =>
          key === 'createdAt' ? new Date(board.createdAt) : (board[key] ?? '')
      : null;
    return sortRows(this.filteredRows(), accessor, this.sortDirection());
  });

  protected readonly pagedRows: Signal<ExaminationBoardRow[]> = computed<
    ExaminationBoardRow[]
  >(() => paginateRows(this.sortedRows(), this.page(), this.pageSize()));

  public constructor() {
    this.store.loadExaminationBoards();

    this.globalSearch.placeholder.set('Search examination boards…');
    inject(DestroyRef).onDestroy((): void => {
      this.globalSearch.placeholder.set('Search...');
      this.globalSearch.query.set('');
    });

    effect((): void => {
      this.globalSearch.query();
      this.page.set(1);
    });
  }

  protected onFilterChange<K extends keyof ExaminationBoardFilters>(
    key: K,
    value: ExaminationBoardFilters[K],
  ): void {
    this.filters.update(
      (current: ExaminationBoardFilters): ExaminationBoardFilters => ({
        ...current,
        [key]: value,
      }),
    );
    this.page.set(1);
  }

  protected toggleFilters(): void {
    this.filtersOpen.update((open: boolean): boolean => !open);
  }

  protected closeFilters(): void {
    this.filtersOpen.set(false);
  }

  protected resetFilters(): void {
    this.filters.set({ ...INITIAL_EXAMINATION_BOARD_FILTERS });
    this.page.set(1);
  }

  protected onSortChange(
    key: ExaminationBoardColumnKey,
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

  protected submitCreate(dto: CreateExaminationBoardDto): void {
    this.creating.set(true);

    this.store.createExaminationBoard(dto, {
      next: (): void => {
        this.creating.set(false);
        this.showCreateForm.set(false);
        this.notificationService.show({
          message: 'Examination board created.',
          type: 'success',
        });
      },
      error: (message: string): void => {
        this.creating.set(false);
        this.notificationService.show({ message, type: 'error' });
      },
    });
  }

  protected toggleMenu(boardId: string): void {
    this.openMenuId.update((current: string | null): string | null =>
      current === boardId ? null : boardId,
    );
  }

  protected closeMenu(): void {
    this.openMenuId.set(null);
  }
}
