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
  CreatePolicyPeriodDto,
  EntityStatus,
  PolicyPeriodResponseDto,
  PolicyPeriodsStore,
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
  NotificationService,
  SortableColumnHeaderComponent,
  TablePaginationComponent,
  StatusPillComponent,
  KpiStatCardComponent,
  KpiCard,
  ENTITY_STATUS_TONES,
} from '@mushaviri/ui';
import { CreatePolicyPeriodDialogComponent } from './create-policy-period-dialog/create-policy-period-dialog.component';
import { PolicyPeriodDetailDrawerComponent } from './policy-period-detail-drawer/policy-period-detail-drawer.component';
import { INITIAL_POLICY_PERIOD_FILTERS } from '../../shared/types/policy-periods/initial-policy-period-filters.const';
import { PolicyPeriodColumnKey } from '../../shared/types/policy-periods/policy-period-column-key.type';
import { PolicyPeriodFilters } from '../../shared/types/policy-periods/policy-period-filters.type';
import { PolicyPeriodRow } from '../../shared/types/policy-periods/policy-period-row.type';

const DEFAULT_PAGE_SIZE: number = 10;

@Component({
  selector: 'org-policy-periods',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    RouterLink,
    OverlayModule,
    CreatePolicyPeriodDialogComponent,
    PolicyPeriodDetailDrawerComponent,
    StatusPillComponent,
    TablePaginationComponent,
    SortableColumnHeaderComponent,
    KpiStatCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './policy-periods.component.html',
})
export class PolicyPeriodsComponent {
  protected readonly EntityStatus: typeof EntityStatus = EntityStatus;

  private readonly store: InstanceType<typeof PolicyPeriodsStore> =
    inject(PolicyPeriodsStore);
  private readonly notificationService: NotificationService =
    inject(NotificationService);
  private readonly globalSearch: GlobalSearchService =
    inject(GlobalSearchService);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);

  protected readonly selectedPolicyPeriodId: Signal<string | null> = toSignal(
    this.route.paramMap.pipe(map((params: ParamMap) => params.get('id'))),
    { initialValue: null },
  );

  protected readonly policyPeriodsLoading: Signal<boolean> =
    this.store.policyPeriodsLoading;
  protected readonly policyPeriodsError: Signal<string | null> =
    this.store.policyPeriodsError;

  protected readonly showCreateForm: WritableSignal<boolean> = signal(false);
  protected readonly creating: WritableSignal<boolean> = signal(false);
  protected readonly openMenuId: WritableSignal<string | null> = signal(null);

  protected readonly filters: WritableSignal<PolicyPeriodFilters> = signal({
    ...INITIAL_POLICY_PERIOD_FILTERS,
  });
  protected readonly filtersOpen: WritableSignal<boolean> = signal(false);
  protected readonly sortKey: WritableSignal<PolicyPeriodColumnKey | null> =
    signal(null);
  protected readonly sortDirection: WritableSignal<SortDirection> =
    signal(null);
  protected readonly page: WritableSignal<number> = signal(1);
  protected readonly pageSize: WritableSignal<number> =
    signal(DEFAULT_PAGE_SIZE);

  protected readonly rows: Signal<PolicyPeriodRow[]> = computed<
    PolicyPeriodRow[]
  >(() =>
    this.store
      .policyPeriods()
      .map((policyPeriod: PolicyPeriodResponseDto): PolicyPeriodRow => ({
        ...policyPeriod,
        statusTone: ENTITY_STATUS_TONES[policyPeriod.status] ?? 'info',
      })),
  );

  protected readonly policyPeriodStats: Signal<KpiCard[]> = computed<KpiCard[]>(
    () => {
      const all: PolicyPeriodRow[] = this.rows();
      return [
        {
          label: 'Total Policy Periods',
          value: String(all.length),
          icon: 'fi fi-rr-calendar-clock',
        },
        {
          label: 'Active',
          value: String(
            all.filter(
              (policyPeriod: PolicyPeriodRow) =>
                policyPeriod.status === EntityStatus.ACTIVE,
            ).length,
          ),
          icon: 'fi fi-rr-check-circle',
        },
        {
          label: 'Units Used',
          value: String(
            new Set(
              all.map((policyPeriod: PolicyPeriodRow) => policyPeriod.unit),
            ).size,
          ),
          icon: 'fi fi-rr-calculator',
        },
      ];
    },
  );

  protected readonly unitOptions: Signal<string[]> = computed<string[]>(() =>
    Array.from(
      new Set(
        this.rows().map(
          (policyPeriod: PolicyPeriodRow): string => policyPeriod.unit,
        ),
      ),
    ),
  );

  protected readonly statusOptions: Signal<string[]> = computed<string[]>(() =>
    Array.from(
      new Set(
        this.rows().map(
          (policyPeriod: PolicyPeriodRow): string => policyPeriod.status,
        ),
      ),
    ),
  );

  protected readonly activeFilterCount: Signal<number> = computed<number>(
    () =>
      Object.values(this.filters()).filter(
        (value: string | null): boolean => value !== '' && value !== null,
      ).length,
  );

  private readonly columnFilters: Signal<ColumnFilter<PolicyPeriodRow>[]> =
    computed<ColumnFilter<PolicyPeriodRow>[]>(() => {
      const current: PolicyPeriodFilters = this.filters();
      return [
        {
          accessor: (policyPeriod: PolicyPeriodRow): string =>
            policyPeriod.name,
          predicate: containsPredicate,
          value: current.name,
        },
        {
          accessor: (policyPeriod: PolicyPeriodRow): string =>
            policyPeriod.unit,
          predicate: equalsPredicate,
          value: current.unit,
        },
        {
          accessor: (policyPeriod: PolicyPeriodRow): string =>
            policyPeriod.status,
          predicate: equalsPredicate,
          value: current.status,
        },
        {
          accessor: (policyPeriod: PolicyPeriodRow): Date =>
            new Date(policyPeriod.createdAt),
          predicate: dateRangePredicate,
          value: { from: current.createdFrom, to: current.createdTo },
        },
      ];
    });

  protected readonly filteredRows: Signal<PolicyPeriodRow[]> = computed<
    PolicyPeriodRow[]
  >(() => {
    const filtered: PolicyPeriodRow[] = filterRows(
      this.rows(),
      this.columnFilters(),
    );
    return searchRows(filtered, this.globalSearch.query(), [
      (policyPeriod: PolicyPeriodRow): string => policyPeriod.name,
      (policyPeriod: PolicyPeriodRow): string => policyPeriod.unit,
      (policyPeriod: PolicyPeriodRow): string => policyPeriod.status,
    ]);
  });

  protected readonly filteredTotal: Signal<number> = computed<number>(
    () => this.filteredRows().length,
  );

  private readonly sortedRows: Signal<PolicyPeriodRow[]> = computed<
    PolicyPeriodRow[]
  >(() => {
    const key: PolicyPeriodColumnKey | null = this.sortKey();
    const accessor: ((policyPeriod: PolicyPeriodRow) => unknown) | null = key
      ? (policyPeriod: PolicyPeriodRow): unknown =>
          key === 'createdAt'
            ? new Date(policyPeriod.createdAt)
            : policyPeriod[key]
      : null;
    return sortRows(this.filteredRows(), accessor, this.sortDirection());
  });

  protected readonly pagedRows: Signal<PolicyPeriodRow[]> = computed<
    PolicyPeriodRow[]
  >(() => paginateRows(this.sortedRows(), this.page(), this.pageSize()));

  public constructor() {
    this.store.loadPolicyPeriods();

    this.globalSearch.placeholder.set('Search policy periods…');
    inject(DestroyRef).onDestroy((): void => {
      this.globalSearch.placeholder.set('Search...');
      this.globalSearch.query.set('');
    });

    effect((): void => {
      this.globalSearch.query();
      this.page.set(1);
    });
  }

  protected onFilterChange<K extends keyof PolicyPeriodFilters>(
    key: K,
    value: PolicyPeriodFilters[K],
  ): void {
    this.filters.update(
      (current: PolicyPeriodFilters): PolicyPeriodFilters => ({
        ...current,
        [key]: value,
      }),
    );
    this.page.set(1);
  }

  protected toggleFilters(): void {
    this.filtersOpen.update((open: boolean) => !open);
  }

  protected closeFilters(): void {
    this.filtersOpen.set(false);
  }

  protected resetFilters(): void {
    this.filters.set({ ...INITIAL_POLICY_PERIOD_FILTERS });
    this.page.set(1);
  }

  protected onSortChange(
    key: PolicyPeriodColumnKey,
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

  protected submitCreate(dto: CreatePolicyPeriodDto): void {
    this.creating.set(true);

    this.store.createPolicyPeriod(dto, {
      next: (): void => {
        this.creating.set(false);
        this.showCreateForm.set(false);
        this.notificationService.show({
          message: 'Policy period created successfully.',
          type: 'success',
        });
      },
      error: (message: string): void => {
        this.creating.set(false);
        this.notificationService.show({ message, type: 'error' });
      },
    });
  }

  protected toggleMenu(policyPeriodId: string): void {
    this.openMenuId.update((current: string | null) =>
      current === policyPeriodId ? null : policyPeriodId,
    );
  }

  protected closeMenu(): void {
    this.openMenuId.set(null);
  }
}
