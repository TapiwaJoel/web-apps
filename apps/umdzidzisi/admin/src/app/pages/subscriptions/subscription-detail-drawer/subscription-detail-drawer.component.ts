import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  InputSignal,
  ResourceRef,
  Signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map, Observable } from 'rxjs';
import {
  NotificationScheduleItemDto,
  SubjectResponseDto,
  SubscriptionPlanResponseDto,
  SubscriptionPlansStore,
  SubscriptionResponseDto,
  SubscriptionsListResponseDto,
  SubscriptionsService,
  SubscriptionsStore,
  SystemUserResponseDto,
  UsersStore,
} from '@mushaviri/api';
import { ADMIN_SERVICE_NAME } from '@mushaviri/util';
import { StatusPillComponent, StatusTone } from '@mushaviri/ui';
import { formatMoney } from '../../../shared/types/subscription-plans/format-money.const';
import { CHANNEL_LABELS } from '../../../shared/types/subscriptions/channel-labels.const';
import { REMINDER_EVENT_LABELS } from '../../../shared/types/subscriptions/reminder-event-labels.const';
import { SelectOption } from '../../../shared/types/common/select-option.type';
import { SUBSCRIPTION_STATUS_OPTIONS } from '../../../shared/types/common/subscription-status-options.const';
import { SUBSCRIPTION_STATUS_TONES } from '../../../shared/types/common/subscription-status-tones.const';
import { BILLING_CYCLE_OPTIONS } from '../../../shared/types/common/billing-cycle-options.const';

/** Identifies the subscription whose notification schedule is fetched. */
interface ScheduleRequest {
  id: string;
  systemUserId: string;
  subscriptionPlanId: string;
}

/** Read-only details of one subscription; admins can't change subscriptions. */
@Component({
  selector: 'org-subscription-detail-drawer',
  standalone: true,
  imports: [DatePipe, RouterLink, StatusPillComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './subscription-detail-drawer.component.html',
})
export class SubscriptionDetailDrawerComponent {
  // Injected services
  private readonly router: Router = inject(Router);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly store: InstanceType<typeof SubscriptionsStore> =
    inject(SubscriptionsStore);
  private readonly subscriptionPlansStore: InstanceType<
    typeof SubscriptionPlansStore
  > = inject(SubscriptionPlansStore);
  private readonly usersStore: InstanceType<typeof UsersStore> =
    inject(UsersStore);
  private readonly subscriptionsService: SubscriptionsService =
    inject(SubscriptionsService);
  private readonly serviceName: string = inject(ADMIN_SERVICE_NAME);

  // State
  protected readonly reminderEventLabels: Partial<Record<string, string>> =
    REMINDER_EVENT_LABELS;
  protected readonly channelLabels: Partial<Record<string, string>> =
    CHANNEL_LABELS;
  protected readonly subscriptionsLoading: Signal<boolean> =
    this.store.subscriptionsLoading;

  // Signal inputs
  public readonly subscriptionId: InputSignal<string> =
    input.required<string>();

  // Computed signals
  protected readonly subscription: Signal<SubscriptionResponseDto | undefined> =
    computed(() =>
      this.store
        .subscriptions()
        .find(
          (subscription: SubscriptionResponseDto): boolean =>
            subscription._id === this.subscriptionId(),
        ),
    );

  protected readonly plan: Signal<SubscriptionPlanResponseDto | undefined> =
    computed(() =>
      this.subscriptionPlansStore
        .subscriptionPlans()
        .find(
          (plan: SubscriptionPlanResponseDto): boolean =>
            plan._id === this.subscription()?.subscriptionPlanId,
        ),
    );

  protected readonly subscriber: Signal<SystemUserResponseDto | undefined> =
    computed(() =>
      this.usersStore
        .users()
        .find(
          (user: SystemUserResponseDto): boolean =>
            user._id === this.subscription()?.systemUserId,
        ),
    );

  protected readonly statusTone: Signal<StatusTone> = computed<StatusTone>(
    () => {
      const subscription: SubscriptionResponseDto | undefined =
        this.subscription();
      return subscription
        ? SUBSCRIPTION_STATUS_TONES[subscription.status]
        : 'info';
    },
  );

  protected readonly statusLabel: Signal<string> = computed<string>(() => {
    const status: string = this.subscription()?.status ?? '';
    return (
      SUBSCRIPTION_STATUS_OPTIONS.find(
        (option: SelectOption): boolean => option.value === status,
      )?.label ?? status
    );
  });

  protected readonly billingCycleLabel: Signal<string> = computed<string>(
    () => {
      const cycle: string = this.subscription()?.billingCycle ?? '';
      return (
        BILLING_CYCLE_OPTIONS.find(
          (option: SelectOption): boolean => option.value === cycle,
        )?.label ?? cycle
      );
    },
  );

  protected readonly amountLabel: Signal<string> = computed<string>(() => {
    const subscription: SubscriptionResponseDto | undefined =
      this.subscription();
    return subscription
      ? formatMoney(subscription.amount, subscription.currency)
      : '';
  });

  protected readonly subjects: Signal<SubjectResponseDto[]> = computed<
    SubjectResponseDto[]
  >(() => this.subscription()?.subjects ?? []);

  /**
   * The list endpoint only returns the notification schedule when asked
   * (`includeNotificationSchedule=true`), so fetch it for this subscription.
   */
  protected readonly scheduleResource: ResourceRef<
    NotificationScheduleItemDto[]
  > = rxResource<NotificationScheduleItemDto[], ScheduleRequest | undefined>({
    params: (): ScheduleRequest | undefined => {
      const subscription: SubscriptionResponseDto | undefined =
        this.subscription();
      return subscription
        ? {
            id: subscription._id,
            systemUserId: subscription.systemUserId,
            subscriptionPlanId: subscription.subscriptionPlanId,
          }
        : undefined;
    },
    stream: ({
      params,
    }: {
      params: ScheduleRequest;
    }): Observable<NotificationScheduleItemDto[]> =>
      this.subscriptionsService
        .list(
          {
            systemUserId: params.systemUserId,
            subscriptionPlanId: params.subscriptionPlanId,
            includeNotificationSchedule: true,
          },
          { limit: 100 },
        )
        .pipe(
          map(
            (
              result: SubscriptionsListResponseDto,
            ): NotificationScheduleItemDto[] =>
              result.subscriptions.find(
                (item: SubscriptionResponseDto): boolean =>
                  item._id === params.id,
              )?.notificationSchedule ?? [],
          ),
        ),
    defaultValue: [],
  });

  protected readonly schedule: Signal<NotificationScheduleItemDto[]> = computed<
    NotificationScheduleItemDto[]
  >(() => {
    const fetched: NotificationScheduleItemDto[] =
      this.scheduleResource.hasValue() ? this.scheduleResource.value() : [];
    const items: NotificationScheduleItemDto[] =
      fetched.length > 0
        ? fetched
        : (this.subscription()?.notificationSchedule ?? []);
    return [...items].sort(
      (
        a: NotificationScheduleItemDto,
        b: NotificationScheduleItemDto,
      ): number =>
        new Date(a.scheduledDate).getTime() -
        new Date(b.scheduledDate).getTime(),
    );
  });

  // Constructor
  public constructor() {
    this.store.loadSubscriptions();
    this.subscriptionPlansStore.loadSubscriptionPlans();
    this.usersStore.loadUsers({ serviceName: this.serviceName });
  }

  // Public methods
  protected close(): void {
    void this.router.navigate(['../'], {
      relativeTo: this.route,
      queryParamsHandling: 'preserve',
    });
  }
}
