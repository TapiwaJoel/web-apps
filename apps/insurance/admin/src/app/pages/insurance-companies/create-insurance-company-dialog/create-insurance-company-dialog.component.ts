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
import {
  CreateInsuranceCompanyDto,
  SystemUserResponseDto,
} from '@mushaviri/api';
import {
  CreateInsuranceCompanyForm,
  EMPTY_FORM,
} from '../../../shared/types/insurance-companies/create-insurance-company-dialog.types';

@Component({
  selector: 'org-create-insurance-company-dialog',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './create-insurance-company-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateInsuranceCompanyDialogComponent {
  public readonly creating: InputSignal<boolean> = input(false);
  public readonly users: InputSignal<SystemUserResponseDto[]> = input<
    SystemUserResponseDto[]
  >([]);

  public readonly create: OutputEmitterRef<CreateInsuranceCompanyDto> =
    output<CreateInsuranceCompanyDto>();
  public readonly closed: OutputEmitterRef<void> = output<void>();

  protected readonly form: WritableSignal<CreateInsuranceCompanyForm> = signal({
    ...EMPTY_FORM,
  });

  protected readonly combinedRate: Signal<number> = computed(
    () => this.form().commissionRate + this.form().marketingRate,
  );

  protected readonly exceedsCombinedLimit: Signal<boolean> = computed(
    () => this.combinedRate() > 100,
  );

  protected readonly isValid: Signal<boolean> = computed(() => {
    const {
      systemUserId,
      commissionRate,
      marketingRate,
    }: CreateInsuranceCompanyForm = this.form();
    return (
      Boolean(systemUserId) &&
      Number.isFinite(commissionRate) &&
      commissionRate >= 0 &&
      commissionRate <= 100 &&
      Number.isFinite(marketingRate) &&
      marketingRate >= 0 &&
      marketingRate <= 100 &&
      commissionRate + marketingRate <= 100
    );
  });

  protected updateForm<K extends keyof CreateInsuranceCompanyForm>(
    field: K,
    value: CreateInsuranceCompanyForm[K],
  ): void {
    this.form.update((current: CreateInsuranceCompanyForm) => ({
      ...current,
      [field]: value,
    }));
  }

  protected onRateChange(
    field: 'commissionRate' | 'marketingRate',
    value: string,
  ): void {
    const rate: number = Number(value);
    this.updateForm(field, Number.isFinite(rate) ? rate : 0);
  }

  protected onSubmit(): void {
    if (!this.isValid() || this.creating()) {
      return;
    }
    const {
      systemUserId,
      commissionRate,
      marketingRate,
    }: CreateInsuranceCompanyForm = this.form();
    this.create.emit({
      systemUserId,
      commissionRate,
      marketingRate,
    });
  }

  protected onCancel(): void {
    if (this.creating()) {
      return;
    }
    this.closed.emit();
  }
}
