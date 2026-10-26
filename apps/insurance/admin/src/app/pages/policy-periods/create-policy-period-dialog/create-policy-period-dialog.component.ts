import {
  ChangeDetectionStrategy,
  Component,
  computed,
  InputSignal,
  input,
  output,
  OutputEmitterRef,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CreatePolicyPeriodDto, PeriodUnit } from '@mushaviri/api';
import {
  CreatePolicyPeriodForm,
  EMPTY_FORM,
} from '../../../shared/types/policy-periods/create-policy-period-dialog.types';

@Component({
  selector: 'org-create-policy-period-dialog',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './create-policy-period-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreatePolicyPeriodDialogComponent {
  protected readonly periodUnits: PeriodUnit[] = Object.values(PeriodUnit);

  public readonly creating: InputSignal<boolean> = input(false);

  public readonly create: OutputEmitterRef<CreatePolicyPeriodDto> =
    output<CreatePolicyPeriodDto>();
  public readonly closed: OutputEmitterRef<void> = output<void>();

  protected readonly form: WritableSignal<CreatePolicyPeriodForm> = signal({
    ...EMPTY_FORM,
  });

  protected readonly isValid: Signal<boolean> = computed(() => {
    const { name, period, unit }: CreatePolicyPeriodForm = this.form();
    return (
      Boolean(name.trim()) &&
      Number.isInteger(period) &&
      period >= 0 &&
      Boolean(unit)
    );
  });

  protected updateForm<K extends keyof CreatePolicyPeriodForm>(
    field: K,
    value: CreatePolicyPeriodForm[K],
  ): void {
    this.form.update((current: CreatePolicyPeriodForm) => ({
      ...current,
      [field]: value,
    }));
  }

  protected onPeriodChange(value: string): void {
    const period: number = Number(value);
    this.updateForm('period', Number.isFinite(period) ? period : 0);
  }

  protected onSubmit(): void {
    if (!this.isValid() || this.creating()) {
      return;
    }
    const { name, period, unit }: CreatePolicyPeriodForm = this.form();
    this.create.emit({
      name: name.trim(),
      period,
      unit,
    });
  }

  protected onCancel(): void {
    if (this.creating()) {
      return;
    }
    this.closed.emit();
  }
}
