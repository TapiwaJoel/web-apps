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
import { DatePipe, LowerCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { OverlayModule } from '@angular/cdk/overlay';
import {
  CreateSubscriptionPlanDto,
  EducationalLevelResponseDto,
  EducationalLevelsStore,
  EntityStatus,
  ExaminationBoardResponseDto,
  ExaminationBoardsStore,
  SubscriptionPlanResponseDto,
  SubscriptionPlansStore,
} from '@mushaviri/api';
import {
  ColumnFilter,
  dateRangePredicate,
  equalsPredicate,
  filterRows,
  GlobalSearchService,
  isDateRangeActive,
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
import { CreateSubscriptionPlanDialogComponent } from './create-subscription-plan-dialog/create-subscription-plan-dialog.component';
import { SubscriptionPlanDetailDrawerComponent } from './subscription-plan-detail-drawer/subscription-plan-detail-drawer.component';
import { SubscriptionPlanRow } from '../../shared/types/subscription-plans/subscription-plan-row.type';
import { SubscriptionPlanFilters } from '../../shared/types/subscription-plans/subscription-plan-filters.type';
import { SubscriptionPlanColumnKey } from '../../shared/types/subscription-plans/subscription-plan-column-key.type';
import { INITIAL_SUBSCRIPTION_PLAN_FILTERS } from '../../shared/types/subscription-plans/initial-subscription-plan-filters.const';
import { formatMoney } from '../../shared/types/subscription-plans/format-money.const';
import { SelectOption } from '../../shared/types/common/select-option.type';
import { BILLING_CYCLE_OPTIONS } from '../../shared/types/common/billing-cycle-options.const';
import { CURRENCY_OPTIONS } from '../../shared/types/common/currency-options.const';
import { ENTITY_STATUS_OPTIONS } from '../../shared/types/common/entity-status-options.const';
import { ENTITY_STATUS_TONES } from '../../shared/types/common/entity-status-tones.const';

const DEFAULT_PAGE_SIZE: number = 10;

@Component({
  selector: 'org-subscription-plans',
  standalone: true,
  imports: [
    DatePipe,
    LowerCasePipe,
    FormsModule,
    RouterLink,
    OverlayModule,
    CreateSubscriptionPlanDialogComponent,
    SubscriptionPlanDetailDrawerComponent,
    KpiStatCardComponent,
    SortableColumnHeaderComponent,
    StatusPillComponent,
    TablePaginationComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './subscription-plans.component.html',
})
export class SubscriptionPlansComponent {
  // Injected services
  private readonly store: InstanceType<typeof SubscriptionPlansStore> = inject(
    SubscriptionPlansStore,
  );
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

  // State
  protected readonly currencyOptions: SelectOption[] = CURRENCY_OPTIONS;
  protected readonly billingCycleOptions: SelectOption[] =
    BILLING_CYCLE_OPTIONS;
  protected readonly statusOptions: SelectOption[] = ENTITY_STATUS_OPTIONS;

  protected readonly selectedPlanId: Signal<string | null> = toSignal(
    this.route.paramMap.pipe(map((params: ParamMap) => params.get('id'))),
    { initialValue: null },
  );

  protected readonly subscriptionPlans: Signal<SubscriptionPlanResponseDto[]> =
    this.store.subscriptionPlans;
  protected readonly subscriptionPlansLoading: Signal<boolean> =
    this.store.subscriptionPlansLoading;
  protected readonly subscriptionPlansError: Signal<string | null> =
    this.store.subscriptionPlansError;
  protected readonly educationalLevels: Signal<EducationalLevelResponseDto[]> =
    this.educationalLevelsStore.educationalLevels;
  protected readonly examinationBoards: Signal<ExaminationBoardResponseDto[]> =
    this.examinationBoardsStore.examinationBoards;

  protected readonly showDialog: WritableSignal<boolean> = signal(false);
  protected readonly saving: WritableSignal<boolean> = signal(false);
  protected readonly openMenuId: WritableSignal<string | null> = signal(null);

  protected readonly filters: WritableSignal<SubscriptionPlanFilters> = signal({
    ...INITIAL_SUBSCRIPTION_PLAN_FILTERS,
  });
  protected readonly filtersOpen: WritableSignal<boolean> = signal(false);
  protected readonly sortKey: WritableSignal<SubscriptionPlanColumnKey | null> =
    signal(null);
  protected readonly sortDirection: WritableSignal<SortDirection> =
    signal(null);
  protected readonly page: WritableSignal<number> = signal(1);
  protected readonly pageSize: WritableSignal<number> =
    signal(DEFAULT_PAGE_SIZE);

  // Computed signals
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

  private readonly boardIdsByLevelId: Signal<Map<string, string>> = computed<
    Map<string, string>
  >(
    () =>
      new Map(
        this.educationalLevels().map(
          (level: EducationalLevelResponseDto): [string, string] => [
            level._id,
            level.examinationBoardId,
          ],
        ),
      ),
  );

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

  private readonly billingCycleLabels: Map<string, string> = new Map(
    BILLING_CYCLE_OPTIONS.map((option: SelectOption): [string, string] => [
      option.value,
      option.label,
    ]),
  );

  protected readonly rows: Signal<SubscriptionPlanRow[]> = computed<
    SubscriptionPlanRow[]
  >(() =>
    this.subscriptionPlans().map(
      (plan: SubscriptionPlanResponseDto): SubscriptionPlanRow => {
        const boardId: string =
          plan.examinationBoardId ??
          this.boardIdsByLevelId().get(plan.educationalLevelId) ??
          '';
        return {
          ...plan,
          examinationBoardId: boardId,
          statusTone: ENTITY_STATUS_TONES[plan.status] ?? 'info',
          educationalLevelName:
            this.educationalLevelNamesById().get(plan.educationalLevelId) ??
            plan.educationalLevelId,
          examinationBoardName:
            this.examinationBoardNamesById().get(boardId) ?? '',
          priceLabel: formatMoney(plan.price, plan.currency),
          billingCycleLabel:
            this.billingCycleLabels.get(plan.billingCycle) ?? plan.billingCycle,
        };
      },
    ),
  );

  protected readonly planStats: Signal<KpiCard[]> = computed<KpiCard[]>(() => {
    const all: SubscriptionPlanRow[] = this.rows();
    const countBy: (status: EntityStatus) => number = (
      status: EntityStatus,
    ): number =>
      all.filter((plan: SubscriptionPlanRow): boolean => plan.status === status)
        .length;
    return [
      {
        label: 'Total plans',
        value: String(all.length),
        icon: 'fi fi-rr-layers',
      },
      {
        label: 'Active',
        value: String(countBy(EntityStatus.ACTIVE)),
        icon: 'fi fi-rr-check-circle',
      },
      {
        label: 'Inactive',
        value: String(countBy(EntityStatus.INACTIVE)),
        icon: 'fi fi-rr-pause-circle',
      },
      {
        label: 'Deleted',
        value: String(countBy(EntityStatus.DELETED)),
        icon: 'fi fi-rr-trash',
      },
    ];
  });

  /** Levels offered in the filter popover, narrowed by the chosen board. */
  protected readonly filterLevelOptions: Signal<EducationalLevelResponseDto[]> =
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
    () => {
      const current: SubscriptionPlanFilters = this.filters();
      const simple: number = [
        current.examinationBoardId,
        current.educationalLevelId,
        current.currency,
        current.billingCycle,
        current.status,
      ].filter((value: string): boolean => value !== '').length;
      const created: number = isDateRangeActive({
        from: current.createdFrom,
        to: current.createdTo,
      })
        ? 1
        : 0;
      return simple + created;
    },
  );

  /** Name of the level a deep link (or the filter) narrows the list to. */
  protected readonly levelFilterName: Signal<string> = computed<string>(() => {
    const levelId: string = this.filters().educationalLevelId;
    return levelId
      ? (this.educationalLevelNamesById().get(levelId) ?? 'Selected level')
      : '';
  });

  private readonly columnFilters: Signal<ColumnFilter<SubscriptionPlanRow>[]> =
    computed<ColumnFilter<SubscriptionPlanRow>[]>(() => {
      const current: SubscriptionPlanFilters = this.filters();
      return [
        {
          accessor: (plan: SubscriptionPlanRow): string =>
            plan.examinationBoardId ?? '',
          predicate: equalsPredicate,
          value: current.examinationBoardId,
        },
        {
          accessor: (plan: SubscriptionPlanRow): string =>
            plan.educationalLevelId,
          predicate: equalsPredicate,
          value: current.educationalLevelId,
        },
        {
          accessor: (plan: SubscriptionPlanRow): string => plan.currency,
          predicate: equalsPredicate,
          value: current.currency,
        },
        {
          accessor: (plan: SubscriptionPlanRow): string => plan.billingCycle,
          predicate: equalsPredicate,
          value: current.billingCycle,
        },
        {
          accessor: (plan: SubscriptionPlanRow): string => plan.status,
          predicate: equalsPredicate,
          value: current.status,
        },
        {
          accessor: (plan: SubscriptionPlanRow): Date =>
            new Date(plan.createdAt),
          predicate: dateRangePredicate,
          value: { from: current.createdFrom, to: current.createdTo },
        },
      ];
    });

  protected readonly filteredRows: Signal<SubscriptionPlanRow[]> = computed<
    SubscriptionPlanRow[]
  >(() =>
    searchRows(
      filterRows(this.rows(), this.columnFilters()),
      this.globalSearch.query(),
      [
        (plan: SubscriptionPlanRow): string => plan.name,
        (plan: SubscriptionPlanRow): string => plan.description ?? '',
        (plan: SubscriptionPlanRow): string => plan.educationalLevelName,
        (plan: SubscriptionPlanRow): string => plan.examinationBoardName,
        (plan: SubscriptionPlanRow): string => plan.currency,
        (plan: SubscriptionPlanRow): string => plan.billingCycleLabel,
        (plan: SubscriptionPlanRow): string => plan.status,
      ],
    ),
  );

  protected readonly filteredTotal: Signal<number> = computed<number>(
    () => this.filteredRows().length,
  );

  private readonly sortedRows: Signal<SubscriptionPlanRow[]> = computed<
    SubscriptionPlanRow[]
  >(() => {
    const key: SubscriptionPlanColumnKey | null = this.sortKey();
    const accessor: ((plan: SubscriptionPlanRow) => unknown) | null = key
      ? (plan: SubscriptionPlanRow): unknown =>
          key === 'createdAt' ? new Date(plan.createdAt) : plan[key]
      : null;
    return sortRows(this.filteredRows(), accessor, this.sortDirection());
  });

  protected readonly pagedRows: Signal<SubscriptionPlanRow[]> = computed<
    SubscriptionPlanRow[]
  >(() => paginateRows(this.sortedRows(), this.page(), this.pageSize()));

  // Constructor
  public constructor() {
    this.store.loadSubscriptionPlans();
    this.educationalLevelsStore.loadEducationalLevels();
    this.examinationBoardsStore.loadExaminationBoards();

    this.globalSearch.placeholder.set('Search subscription plans…');
    inject(DestroyRef).onDestroy((): void => {
      this.globalSearch.placeholder.set('Search...');
      this.globalSearch.query.set('');
    });

    effect((): void => {
      this.globalSearch.query();
      this.page.set(1);
    });

    // The level filter lives in the URL so "View plans →" links land
    // pre-filtered and survive opening/closing a detail drawer.
    this.route.queryParamMap
      .pipe(takeUntilDestroyed())
      .subscribe((params: ParamMap): void => {
        this.filters.update(
          (current: SubscriptionPlanFilters): SubscriptionPlanFilters => ({
            ...current,
            educationalLevelId: params.get('educationalLevelId') ?? '',
          }),
        );
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

  protected submitDialog(dto: CreateSubscriptionPlanDto): void {
    this.saving.set(true);
    this.store.createSubscriptionPlan(dto, {
      next: (): void => {
        this.saving.set(false);
        this.showDialog.set(false);
        this.notificationService.show({
          message: `Plan "${dto.name}" created.`,
          type: 'success',
        });
      },
      error: (message: string): void => {
        this.saving.set(false);
        this.notificationService.show({ message, type: 'error' });
      },
    });
  }

  protected onFilterChange<K extends keyof SubscriptionPlanFilters>(
    key: K,
    value: SubscriptionPlanFilters[K],
  ): void {
    if (key === 'educationalLevelId') {
      this.setLevelQueryParam((value as string) || null);
      return;
    }
    this.filters.update(
      (current: SubscriptionPlanFilters): SubscriptionPlanFilters => ({
        ...current,
        [key]: value,
      }),
    );
    if (key === 'examinationBoardId') {
      // Changing the board invalidates a level from another board.
      this.setLevelQueryParam(null);
    }
    this.page.set(1);
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
    this.filters.set({ ...INITIAL_SUBSCRIPTION_PLAN_FILTERS });
    this.setLevelQueryParam(null);
    this.page.set(1);
  }

  protected onSortChange(
    key: SubscriptionPlanColumnKey,
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
  private setLevelQueryParam(educationalLevelId: string | null): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { educationalLevelId },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
