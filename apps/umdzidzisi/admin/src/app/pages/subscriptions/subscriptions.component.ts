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
  SubscriptionPlanResponseDto,
  SubscriptionPlansStore,
  SubscriptionResponseDto,
  SubscriptionsStore,
  SubscriptionStatus,
  SystemUserResponseDto,
  UsersStore,
} from '@mushaviri/api';
import {
  ADMIN_SERVICE_NAME,
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
  SortableColumnHeaderComponent,
  StatusPillComponent,
  TablePaginationComponent,
} from '@mushaviri/ui';
import { SubscriptionDetailDrawerComponent } from './subscription-detail-drawer/subscription-detail-drawer.component';
import { SubscriptionRow } from '../../shared/types/subscriptions/subscription-row.type';
import { SubscriptionFilters } from '../../shared/types/subscriptions/subscription-filters.type';
import { SubscriptionColumnKey } from '../../shared/types/subscriptions/subscription-column-key.type';
import { INITIAL_SUBSCRIPTION_FILTERS } from '../../shared/types/subscriptions/initial-subscription-filters.const';
import { formatMoney } from '../../shared/types/subscription-plans/format-money.const';
import { SelectOption } from '../../shared/types/common/select-option.type';
import { BILLING_CYCLE_OPTIONS } from '../../shared/types/common/billing-cycle-options.const';
import { SUBSCRIPTION_STATUS_OPTIONS } from '../../shared/types/common/subscription-status-options.const';
import { SUBSCRIPTION_STATUS_TONES } from '../../shared/types/common/subscription-status-tones.const';

const DEFAULT_PAGE_SIZE: number = 10;

function toLabelMap(options: SelectOption[]): Map<string, string> {
  return new Map(
    options.map((option: SelectOption): [string, string] => [
      option.value,
      option.label,
    ]),
  );
}

/**
 * Read-only list of learner subscriptions. Learners create subscriptions from
 * the client app and the API exposes no update/cancel endpoint, so there is
 * no create button and the `:id` drawer only shows details.
 */
@Component({
  selector: 'org-subscriptions',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    RouterLink,
    OverlayModule,
    SubscriptionDetailDrawerComponent,
    KpiStatCardComponent,
    SortableColumnHeaderComponent,
    StatusPillComponent,
    TablePaginationComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './subscriptions.component.html',
})
export class SubscriptionsComponent {
  // Injected services
  private readonly store: InstanceType<typeof SubscriptionsStore> =
    inject(SubscriptionsStore);
  private readonly subscriptionPlansStore: InstanceType<
    typeof SubscriptionPlansStore
  > = inject(SubscriptionPlansStore);
  private readonly usersStore: InstanceType<typeof UsersStore> =
    inject(UsersStore);
  private readonly serviceName: string = inject(ADMIN_SERVICE_NAME);
  private readonly globalSearch: GlobalSearchService =
    inject(GlobalSearchService);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);

  // State
  protected readonly statusOptions: SelectOption[] =
    SUBSCRIPTION_STATUS_OPTIONS;

  protected readonly selectedSubscriptionId: Signal<string | null> = toSignal(
    this.route.paramMap.pipe(map((params: ParamMap) => params.get('id'))),
    { initialValue: null },
  );

  protected readonly subscriptions: Signal<SubscriptionResponseDto[]> =
    this.store.subscriptions;
  protected readonly subscriptionsLoading: Signal<boolean> =
    this.store.subscriptionsLoading;
  protected readonly subscriptionsError: Signal<string | null> =
    this.store.subscriptionsError;
  protected readonly subscriptionPlans: Signal<SubscriptionPlanResponseDto[]> =
    this.subscriptionPlansStore.subscriptionPlans;

  protected readonly openMenuId: WritableSignal<string | null> = signal(null);
  protected readonly filters: WritableSignal<SubscriptionFilters> = signal({
    ...INITIAL_SUBSCRIPTION_FILTERS,
  });
  protected readonly filtersOpen: WritableSignal<boolean> = signal(false);
  protected readonly sortKey: WritableSignal<SubscriptionColumnKey | null> =
    signal(null);
  protected readonly sortDirection: WritableSignal<SortDirection> =
    signal(null);
  protected readonly page: WritableSignal<number> = signal(1);
  protected readonly pageSize: WritableSignal<number> =
    signal(DEFAULT_PAGE_SIZE);

  private readonly statusLabels: Map<string, string> = toLabelMap(
    SUBSCRIPTION_STATUS_OPTIONS,
  );
  private readonly billingCycleLabels: Map<string, string> = toLabelMap(
    BILLING_CYCLE_OPTIONS,
  );

  // Computed signals
  private readonly planNamesById: Signal<Map<string, string>> = computed<
    Map<string, string>
  >(
    () =>
      new Map(
        this.subscriptionPlans().map(
          (plan: SubscriptionPlanResponseDto): [string, string] => [
            plan._id,
            plan.name,
          ],
        ),
      ),
  );

  private readonly userNamesById: Signal<Map<string, string>> = computed<
    Map<string, string>
  >(
    () =>
      new Map(
        this.usersStore
          .users()
          .map((user: SystemUserResponseDto): [string, string] => [
            user._id,
            user.name,
          ]),
      ),
  );

  protected readonly rows: Signal<SubscriptionRow[]> = computed<
    SubscriptionRow[]
  >(() =>
    this.subscriptions().map(
      (subscription: SubscriptionResponseDto): SubscriptionRow => ({
        ...subscription,
        statusTone: SUBSCRIPTION_STATUS_TONES[subscription.status] ?? 'info',
        statusLabel:
          this.statusLabels.get(subscription.status) ?? subscription.status,
        subscriberName:
          this.userNamesById().get(subscription.systemUserId) ??
          subscription.systemUserId,
        planName:
          this.planNamesById().get(subscription.subscriptionPlanId) ??
          subscription.subscriptionPlanId,
        amountLabel: formatMoney(subscription.amount, subscription.currency),
        billingCycleLabel:
          this.billingCycleLabels.get(subscription.billingCycle) ??
          subscription.billingCycle,
      }),
    ),
  );

  protected readonly subscriptionStats: Signal<KpiCard[]> = computed<KpiCard[]>(
    () => {
      const all: SubscriptionRow[] = this.rows();
      const countIn: (...statuses: SubscriptionStatus[]) => number = (
        ...statuses: SubscriptionStatus[]
      ): number =>
        all.filter((row: SubscriptionRow): boolean =>
          statuses.includes(row.status),
        ).length;
      return [
        {
          label: 'Active',
          value: String(countIn(SubscriptionStatus.ACTIVE)),
          icon: 'fi fi-rr-check-circle',
        },
        {
          label: 'Grace period',
          value: String(countIn(SubscriptionStatus.GRACE_PERIOD)),
          icon: 'fi fi-rr-hourglass-end',
        },
        {
          label: 'Expired / cancelled',
          value: String(
            countIn(SubscriptionStatus.EXPIRED, SubscriptionStatus.CANCELLED),
          ),
          icon: 'fi fi-rr-calendar-xmark',
        },
      ];
    },
  );

  protected readonly activeFilterCount: Signal<number> = computed<number>(
    () => {
      const current: SubscriptionFilters = this.filters();
      return (
        [current.status, current.subscriptionPlanId].filter(
          (value: string): boolean => value !== '',
        ).length +
        (isDateRangeActive({ from: current.startFrom, to: current.startTo })
          ? 1
          : 0) +
        (isDateRangeActive({ from: current.endFrom, to: current.endTo })
          ? 1
          : 0)
      );
    },
  );

  protected readonly planFilterName: Signal<string> = computed<string>(() => {
    const planId: string = this.filters().subscriptionPlanId;
    return planId ? (this.planNamesById().get(planId) ?? 'Selected plan') : '';
  });

  private readonly columnFilters: Signal<ColumnFilter<SubscriptionRow>[]> =
    computed<ColumnFilter<SubscriptionRow>[]>(() => {
      const current: SubscriptionFilters = this.filters();
      return [
        {
          accessor: (row: SubscriptionRow): string => row.status,
          predicate: equalsPredicate,
          value: current.status,
        },
        {
          accessor: (row: SubscriptionRow): string => row.subscriptionPlanId,
          predicate: equalsPredicate,
          value: current.subscriptionPlanId,
        },
        {
          accessor: (row: SubscriptionRow): Date => new Date(row.startDate),
          predicate: dateRangePredicate,
          value: { from: current.startFrom, to: current.startTo },
        },
        {
          accessor: (row: SubscriptionRow): Date => new Date(row.endDate),
          predicate: dateRangePredicate,
          value: { from: current.endFrom, to: current.endTo },
        },
      ];
    });

  protected readonly filteredRows: Signal<SubscriptionRow[]> = computed<
    SubscriptionRow[]
  >(() =>
    searchRows(
      filterRows(this.rows(), this.columnFilters()),
      this.globalSearch.query(),
      [
        (row: SubscriptionRow): string => row.subscriberName,
        (row: SubscriptionRow): string => row.planName,
        (row: SubscriptionRow): string => row.statusLabel,
        (row: SubscriptionRow): string => row.currency,
        (row: SubscriptionRow): string => row.paymentId ?? '',
      ],
    ),
  );

  protected readonly filteredTotal: Signal<number> = computed<number>(
    () => this.filteredRows().length,
  );

  private readonly sortedRows: Signal<SubscriptionRow[]> = computed<
    SubscriptionRow[]
  >(() => {
    const key: SubscriptionColumnKey | null = this.sortKey();
    const accessor: ((row: SubscriptionRow) => unknown) | null = key
      ? (row: SubscriptionRow): unknown => {
          if (
            key === 'startDate' ||
            key === 'endDate' ||
            key === 'gracePeriodEndDate'
          ) {
            const value: string | undefined = row[key];
            return value ? new Date(value) : null;
          }
          return row[key];
        }
      : null;
    return sortRows(this.filteredRows(), accessor, this.sortDirection());
  });

  protected readonly pagedRows: Signal<SubscriptionRow[]> = computed<
    SubscriptionRow[]
  >(() => paginateRows(this.sortedRows(), this.page(), this.pageSize()));

  // Constructor
  public constructor() {
    this.store.loadSubscriptions();
    this.subscriptionPlansStore.loadSubscriptionPlans();
    this.usersStore.loadUsers({ serviceName: this.serviceName });

    this.globalSearch.placeholder.set('Search subscriptions…');
    inject(DestroyRef).onDestroy((): void => {
      this.globalSearch.placeholder.set('Search...');
      this.globalSearch.query.set('');
    });

    effect((): void => {
      this.globalSearch.query();
      this.page.set(1);
    });

    // The plan filter lives in the URL so "View subscriptions →" links land
    // pre-filtered and survive opening/closing a detail drawer.
    this.route.queryParamMap
      .pipe(takeUntilDestroyed())
      .subscribe((params: ParamMap): void => {
        this.filters.update(
          (current: SubscriptionFilters): SubscriptionFilters => ({
            ...current,
            subscriptionPlanId: params.get('subscriptionPlanId') ?? '',
          }),
        );
        this.page.set(1);
      });
  }

  // Public methods
  protected onFilterChange<K extends keyof SubscriptionFilters>(
    key: K,
    value: SubscriptionFilters[K],
  ): void {
    if (key === 'subscriptionPlanId') {
      this.setPlanQueryParam((value as string) || null);
      return;
    }
    this.filters.update(
      (current: SubscriptionFilters): SubscriptionFilters => ({
        ...current,
        [key]: value,
      }),
    );
    this.page.set(1);
  }

  protected clearPlanFilter(): void {
    this.onFilterChange('subscriptionPlanId', '');
  }

  protected toggleFilters(): void {
    this.filtersOpen.update((open: boolean): boolean => !open);
  }

  protected closeFilters(): void {
    this.filtersOpen.set(false);
  }

  protected resetFilters(): void {
    this.filters.set({ ...INITIAL_SUBSCRIPTION_FILTERS });
    this.setPlanQueryParam(null);
    this.page.set(1);
  }

  protected onSortChange(
    key: SubscriptionColumnKey,
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
  private setPlanQueryParam(subscriptionPlanId: string | null): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { subscriptionPlanId },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
