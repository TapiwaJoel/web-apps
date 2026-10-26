import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  InputSignal,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  BillingCycle,
  Currency,
  EducationalLevelResponseDto,
  EducationalLevelsStore,
  EntityStatus,
  ExaminationBoardResponseDto,
  ExaminationBoardsStore,
  SubscriptionPlanResponseDto,
  SubscriptionPlansStore,
  UpdateSubscriptionPlanDto,
} from '@mushaviri/api';
import {
  NotificationService,
  StatusPillComponent,
  StatusTone,
} from '@mushaviri/ui';
import { SubscriptionPlanForm } from '../../../shared/types/subscription-plans/subscription-plan-form.type';
import { SubscriptionPlanConflicts } from '../../../shared/types/subscription-plans/subscription-plan-conflicts.type';
import { findSubscriptionPlanConflicts } from '../../../shared/types/subscription-plans/find-subscription-plan-conflicts.const';
import { isSubscriptionPlanFormValid } from '../../../shared/types/subscription-plans/is-subscription-plan-form-valid.const';
import { formatMoney } from '../../../shared/types/subscription-plans/format-money.const';
import { SelectOption } from '../../../shared/types/common/select-option.type';
import { BILLING_CYCLE_OPTIONS } from '../../../shared/types/common/billing-cycle-options.const';
import { CURRENCY_OPTIONS } from '../../../shared/types/common/currency-options.const';
import { ENTITY_STATUS_OPTIONS } from '../../../shared/types/common/entity-status-options.const';
import { ENTITY_STATUS_TONES } from '../../../shared/types/common/entity-status-tones.const';

/** The drawer form: every mutable plan field, plus status. */
interface PlanEditForm extends SubscriptionPlanForm {
  status: EntityStatus;
}

@Component({
  selector: 'org-subscription-plan-detail-drawer',
  standalone: true,
  imports: [DatePipe, FormsModule, RouterLink, StatusPillComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './subscription-plan-detail-drawer.component.html',
})
export class SubscriptionPlanDetailDrawerComponent {
  // Injected services
  private readonly router: Router = inject(Router);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
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

  // State
  protected readonly currencyOptions: SelectOption<Currency>[] =
    CURRENCY_OPTIONS;
  protected readonly billingCycleOptions: SelectOption<BillingCycle>[] =
    BILLING_CYCLE_OPTIONS;
  protected readonly statusOptions: SelectOption<EntityStatus>[] =
    ENTITY_STATUS_OPTIONS;

  protected readonly subscriptionPlansLoading: Signal<boolean> =
    this.store.subscriptionPlansLoading;
  protected readonly educationalLevels: Signal<EducationalLevelResponseDto[]> =
    this.educationalLevelsStore.educationalLevels;
  protected readonly saving: WritableSignal<boolean> = signal(false);

  private readonly editedForm: WritableSignal<PlanEditForm | null> =
    signal(null);

  // Signal inputs
  public readonly subscriptionPlanId: InputSignal<string> =
    input.required<string>();

  // Computed signals
  protected readonly plan: Signal<SubscriptionPlanResponseDto | undefined> =
    computed(() =>
      this.store
        .subscriptionPlans()
        .find(
          (plan: SubscriptionPlanResponseDto): boolean =>
            plan._id === this.subscriptionPlanId(),
        ),
    );

  protected readonly statusTone: Signal<StatusTone> = computed<StatusTone>(
    () => ENTITY_STATUS_TONES[this.plan()?.status ?? EntityStatus.ACTIVE],
  );

  protected readonly formValue: Signal<PlanEditForm> = computed<PlanEditForm>(
    () => {
      const edited: PlanEditForm | null = this.editedForm();
      if (edited) {
        return edited;
      }
      const plan: SubscriptionPlanResponseDto | undefined = this.plan();
      return {
        educationalLevelId: plan?.educationalLevelId ?? '',
        name: plan?.name ?? '',
        description: plan?.description ?? '',
        price: plan?.price ?? null,
        currency: plan?.currency ?? '',
        numberOfSubjects: plan?.numberOfSubjects ?? null,
        billingCycle: plan?.billingCycle ?? '',
        gracePeriodDays: plan?.gracePeriodDays ?? 0,
        status: plan?.status ?? EntityStatus.ACTIVE,
      };
    },
  );

  protected readonly examinationBoardName: Signal<string> = computed<string>(
    () => {
      const levelId: string = this.formValue().educationalLevelId;
      const boardId: string | undefined =
        this.educationalLevels().find(
          (level: EducationalLevelResponseDto): boolean =>
            level._id === levelId,
        )?.examinationBoardId ?? this.plan()?.examinationBoardId;
      return (
        this.examinationBoardsStore
          .examinationBoards()
          .find(
            (board: ExaminationBoardResponseDto): boolean =>
              board._id === boardId,
          )?.name ?? ''
      );
    },
  );

  /** Every level, labelled with its board so same-named levels stay distinct. */
  protected readonly levelOptions: Signal<SelectOption[]> = computed<
    SelectOption[]
  >(() => {
    const boardNames: Map<string, string> = new Map(
      this.examinationBoardsStore
        .examinationBoards()
        .map((board: ExaminationBoardResponseDto): [string, string] => [
          board._id,
          board.name,
        ]),
    );
    return this.educationalLevels().map(
      (level: EducationalLevelResponseDto): SelectOption => {
        const boardName: string | undefined = boardNames.get(
          level.examinationBoardId,
        );
        return {
          value: level._id,
          label: boardName ? `${level.name} · ${boardName}` : level.name,
        };
      },
    );
  });

  protected readonly priceLabel: Signal<string> = computed<string>(() => {
    const plan: SubscriptionPlanResponseDto | undefined = this.plan();
    return plan ? formatMoney(plan.price, plan.currency) : '';
  });

  protected readonly conflicts: Signal<SubscriptionPlanConflicts> =
    computed<SubscriptionPlanConflicts>(() =>
      findSubscriptionPlanConflicts(
        this.formValue(),
        this.store.subscriptionPlans(),
        this.subscriptionPlanId(),
      ),
    );

  protected readonly isDirty: Signal<boolean> = computed<boolean>(
    () => this.editedForm() !== null,
  );

  protected readonly isValid: Signal<boolean> = computed<boolean>(
    () =>
      isSubscriptionPlanFormValid(this.formValue()) &&
      !this.conflicts().nameTaken,
  );

  // Constructor
  public constructor() {
    this.store.loadSubscriptionPlans();
    this.educationalLevelsStore.loadEducationalLevels();
    this.examinationBoardsStore.loadExaminationBoards();
  }

  // Public methods
  protected updateForm<K extends keyof PlanEditForm>(
    field: K,
    value: PlanEditForm[K],
  ): void {
    this.editedForm.set({ ...this.formValue(), [field]: value });
  }

  protected savePlan(): void {
    if (!this.isValid() || this.saving()) {
      return;
    }
    const form: PlanEditForm = this.formValue();
    const dto: UpdateSubscriptionPlanDto = {
      educationalLevelId: form.educationalLevelId,
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      currency: form.currency as Currency,
      numberOfSubjects: Number(form.numberOfSubjects),
      billingCycle: form.billingCycle as BillingCycle,
      gracePeriodDays: Number(form.gracePeriodDays),
      status: form.status,
    };
    this.saving.set(true);
    this.store.updateSubscriptionPlan(this.subscriptionPlanId(), dto, {
      next: (): void => {
        this.saving.set(false);
        this.editedForm.set(null);
        this.notificationService.show({
          message: 'Plan changes saved.',
          type: 'success',
        });
      },
      error: (message: string): void => {
        this.saving.set(false);
        this.notificationService.show({ message, type: 'error' });
      },
    });
  }

  protected close(): void {
    void this.router.navigate(['../'], {
      relativeTo: this.route,
      queryParamsHandling: 'preserve',
    });
  }
}
