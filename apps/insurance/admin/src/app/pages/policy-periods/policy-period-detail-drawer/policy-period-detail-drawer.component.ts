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
import { ActivatedRoute, Router } from '@angular/router';
import {
  EntityStatus,
  PeriodUnit,
  PolicyPeriodResponseDto,
  PolicyPeriodsStore,
  UpdatePolicyPeriodDto,
} from '@mushaviri/api';
import {
  NotificationService,
  StatusPillComponent,
  StatusTone,
  ENTITY_STATUS_TONES,
} from '@mushaviri/ui';

interface PolicyPeriodForm {
  name: string;
  period: number;
  unit: PeriodUnit;
}

@Component({
  selector: 'org-policy-period-detail-drawer',
  standalone: true,
  imports: [DatePipe, FormsModule, StatusPillComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './policy-period-detail-drawer.component.html',
})
export class PolicyPeriodDetailDrawerComponent {
  protected readonly periodUnits: PeriodUnit[] = Object.values(PeriodUnit);

  private readonly router: Router = inject(Router);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly store: InstanceType<typeof PolicyPeriodsStore> =
    inject(PolicyPeriodsStore);
  private readonly notificationService: NotificationService =
    inject(NotificationService);

  public readonly policyPeriodId: InputSignal<string> =
    input.required<string>();

  protected readonly policyPeriodsLoading: Signal<boolean> =
    this.store.policyPeriodsLoading;

  protected readonly policyPeriod: Signal<PolicyPeriodResponseDto | undefined> =
    computed(() =>
      this.store
        .policyPeriods()
        .find(
          (policyPeriod: PolicyPeriodResponseDto) =>
            policyPeriod._id === this.policyPeriodId(),
        ),
    );

  protected readonly statusTone: Signal<StatusTone> = computed(
    () =>
      ENTITY_STATUS_TONES[this.policyPeriod()?.status ?? EntityStatus.ACTIVE] ??
      'info',
  );

  protected readonly saving: WritableSignal<boolean> = signal(false);

  private readonly editedForm: WritableSignal<PolicyPeriodForm | null> =
    signal(null);

  protected readonly formValue: Signal<PolicyPeriodForm> = computed(() => {
    const edited: PolicyPeriodForm | null = this.editedForm();
    if (edited) {
      return edited;
    }
    const policyPeriod: PolicyPeriodResponseDto | undefined =
      this.policyPeriod();
    return {
      name: policyPeriod?.name ?? '',
      period: policyPeriod?.period ?? 0,
      unit: policyPeriod?.unit ?? PeriodUnit.MONTHS,
    };
  });

  public constructor() {
    this.store.loadPolicyPeriods();
  }

  protected updateForm<K extends keyof PolicyPeriodForm>(
    field: K,
    value: PolicyPeriodForm[K],
  ): void {
    this.editedForm.set({ ...this.formValue(), [field]: value });
  }

  protected onPeriodChange(value: string): void {
    const period: number = Number(value);
    this.updateForm('period', Number.isFinite(period) ? period : 0);
  }

  protected savePolicyPeriod(): void {
    this.saving.set(true);
    const { name, period, unit }: PolicyPeriodForm = this.formValue();
    const dto: UpdatePolicyPeriodDto = { name, period, unit };
    this.store.updatePolicyPeriod(this.policyPeriodId(), dto, {
      next: (): void => {
        this.saving.set(false);
        this.editedForm.set(null);
        this.notificationService.show({
          message: 'Policy period updated successfully.',
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
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
