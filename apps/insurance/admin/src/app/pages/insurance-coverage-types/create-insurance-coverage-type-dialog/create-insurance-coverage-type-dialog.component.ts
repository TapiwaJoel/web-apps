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
import { CreateInsuranceCoverageTypeDto } from '@mushaviri/api';
import {
  CreateInsuranceCoverageTypeForm,
  EMPTY_FORM,
} from '../../../shared/types/insurance-coverage-types/create-insurance-coverage-type-dialog.types';

@Component({
  selector: 'org-create-insurance-coverage-type-dialog',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './create-insurance-coverage-type-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateInsuranceCoverageTypeDialogComponent {
  public readonly insuranceCompanyOptions: InputSignal<
    { id: string; label: string }[]
  > = input<{ id: string; label: string }[]>([]);
  public readonly creating: InputSignal<boolean> = input(false);

  public readonly create: OutputEmitterRef<CreateInsuranceCoverageTypeDto> =
    output<CreateInsuranceCoverageTypeDto>();
  public readonly closed: OutputEmitterRef<void> = output<void>();

  protected readonly form: WritableSignal<CreateInsuranceCoverageTypeForm> =
    signal({ ...EMPTY_FORM });

  protected readonly isValid: Signal<boolean> = computed(
    () =>
      Boolean(this.form().insuranceCompany.trim()) &&
      Boolean(this.form().name.trim()),
  );

  protected updateForm<K extends keyof CreateInsuranceCoverageTypeForm>(
    field: K,
    value: CreateInsuranceCoverageTypeForm[K],
  ): void {
    this.form.update((current: CreateInsuranceCoverageTypeForm) => ({
      ...current,
      [field]: value,
    }));
  }

  protected onSubmit(): void {
    if (!this.isValid() || this.creating()) {
      return;
    }
    const {
      insuranceCompany,
      name,
      description,
    }: CreateInsuranceCoverageTypeForm = this.form();
    this.create.emit({
      insuranceCompany,
      name: name.trim(),
      description: description.trim() || undefined,
    });
  }

  protected onCancel(): void {
    if (this.creating()) {
      return;
    }
    this.closed.emit();
  }
}
