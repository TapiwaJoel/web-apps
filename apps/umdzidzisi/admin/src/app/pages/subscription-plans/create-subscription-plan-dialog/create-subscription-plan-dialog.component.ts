import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  InputSignal,
  OnInit,
  output,
  OutputEmitterRef,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  BillingCycle,
  CreateSubscriptionPlanDto,
  Currency,
  EducationalLevelResponseDto,
  ExaminationBoardResponseDto,
  SubscriptionPlanResponseDto,
} from '@mushaviri/api';
import { SubscriptionPlanForm } from '../../../shared/types/subscription-plans/subscription-plan-form.type';
import { EMPTY_SUBSCRIPTION_PLAN_FORM } from '../../../shared/types/subscription-plans/empty-subscription-plan-form.const';
import { SubscriptionPlanConflicts } from '../../../shared/types/subscription-plans/subscription-plan-conflicts.type';
import { findSubscriptionPlanConflicts } from '../../../shared/types/subscription-plans/find-subscription-plan-conflicts.const';
import { isSubscriptionPlanFormValid } from '../../../shared/types/subscription-plans/is-subscription-plan-form-valid.const';
import { formatMoney } from '../../../shared/types/subscription-plans/format-money.const';
import { SelectOption } from '../../../shared/types/common/select-option.type';
import { BILLING_CYCLE_OPTIONS } from '../../../shared/types/common/billing-cycle-options.const';
import { CURRENCY_OPTIONS } from '../../../shared/types/common/currency-options.const';

@Component({
  selector: 'org-create-subscription-plan-dialog',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './create-subscription-plan-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateSubscriptionPlanDialogComponent implements OnInit {
  // State
  protected readonly currencyOptions: SelectOption<Currency>[] =
    CURRENCY_OPTIONS;
  protected readonly billingCycleOptions: SelectOption<BillingCycle>[] =
    BILLING_CYCLE_OPTIONS;

  protected readonly form: WritableSignal<SubscriptionPlanForm> = signal({
    ...EMPTY_SUBSCRIPTION_PLAN_FORM,
  });
  /** Narrows the level select only; plans store the level, not the board. */
  protected readonly examinationBoardId: WritableSignal<string> = signal('');

  // Signal inputs
  public readonly educationalLevels: InputSignal<
    EducationalLevelResponseDto[]
  > = input<EducationalLevelResponseDto[]>([]);
  public readonly examinationBoards: InputSignal<
    ExaminationBoardResponseDto[]
  > = input<ExaminationBoardResponseDto[]>([]);
  public readonly existingPlans: InputSignal<SubscriptionPlanResponseDto[]> =
    input<SubscriptionPlanResponseDto[]>([]);
  public readonly initialEducationalLevelId: InputSignal<string> =
    input<string>('');
  public readonly creating: InputSignal<boolean> = input(false);

  // Signal outputs
  public readonly create: OutputEmitterRef<CreateSubscriptionPlanDto> =
    output<CreateSubscriptionPlanDto>();
  public readonly closed: OutputEmitterRef<void> = output<void>();

  // Computed signals
  protected readonly availableLevels: Signal<EducationalLevelResponseDto[]> =
    computed<EducationalLevelResponseDto[]>(() => {
      const boardId: string = this.examinationBoardId();
      return boardId
        ? this.educationalLevels().filter(
            (level: EducationalLevelResponseDto): boolean =>
              level.examinationBoardId === boardId,
          )
        : this.educationalLevels();
    });

  protected readonly conflicts: Signal<SubscriptionPlanConflicts> =
    computed<SubscriptionPlanConflicts>(() =>
      findSubscriptionPlanConflicts(this.form(), this.existingPlans()),
    );

  protected readonly pricePreview: Signal<string> = computed<string>(() => {
    const { price, currency }: SubscriptionPlanForm = this.form();
    return price !== null && price > 0 && currency
      ? formatMoney(price, currency)
      : '';
  });

  protected readonly isValid: Signal<boolean> = computed<boolean>(
    () =>
      isSubscriptionPlanFormValid(this.form()) && !this.conflicts().nameTaken,
  );

  // Lifecycle hooks
  public ngOnInit(): void {
    const levelId: string = this.initialEducationalLevelId();
    const level: EducationalLevelResponseDto | undefined =
      this.educationalLevels().find(
        (candidate: EducationalLevelResponseDto): boolean =>
          candidate._id === levelId,
      );
    if (level) {
      this.examinationBoardId.set(level.examinationBoardId);
      this.updateForm('educationalLevelId', level._id);
    }
  }

  // Public methods
  protected updateForm<K extends keyof SubscriptionPlanForm>(
    field: K,
    value: SubscriptionPlanForm[K],
  ): void {
    this.form.update((current: SubscriptionPlanForm): SubscriptionPlanForm => ({
      ...current,
      [field]: value,
    }));
  }

  protected onBoardChange(boardId: string): void {
    this.examinationBoardId.set(boardId);
    this.updateForm('educationalLevelId', '');
  }

  protected onSubmit(): void {
    if (!this.isValid() || this.creating()) {
      return;
    }
    const form: SubscriptionPlanForm = this.form();
    const description: string = form.description.trim();
    this.create.emit({
      educationalLevelId: form.educationalLevelId,
      name: form.name.trim(),
      ...(description ? { description } : {}),
      price: Number(form.price),
      currency: form.currency as Currency,
      numberOfSubjects: Number(form.numberOfSubjects),
      billingCycle: form.billingCycle as BillingCycle,
      gracePeriodDays: Number(form.gracePeriodDays),
    });
  }

  protected onCancel(): void {
    if (this.creating()) {
      return;
    }
    this.closed.emit();
  }
}
