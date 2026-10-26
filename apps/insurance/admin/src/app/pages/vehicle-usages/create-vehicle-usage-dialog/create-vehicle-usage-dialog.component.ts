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
import { CreateVehicleUsageDto, VehicleTypeResponseDto } from '@mushaviri/api';
import {
  CreateVehicleUsageForm,
  EMPTY_FORM,
} from '../../../shared/types/vehicle-usages/create-vehicle-usage-dialog.types';

@Component({
  selector: 'org-create-vehicle-usage-dialog',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './create-vehicle-usage-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateVehicleUsageDialogComponent {
  public readonly vehicleTypes: InputSignal<VehicleTypeResponseDto[]> = input<
    VehicleTypeResponseDto[]
  >([]);
  public readonly creating: InputSignal<boolean> = input(false);

  public readonly create: OutputEmitterRef<CreateVehicleUsageDto> =
    output<CreateVehicleUsageDto>();
  public readonly closed: OutputEmitterRef<void> = output<void>();

  protected readonly form: WritableSignal<CreateVehicleUsageForm> = signal({
    ...EMPTY_FORM,
  });

  private readonly parsedUsages: Signal<string[]> = computed(() =>
    this.form()
      .usagesText.split('\n')
      .map((usage: string) => usage.trim())
      .filter((usage: string) => usage.length > 0),
  );

  protected readonly isValid: Signal<boolean> = computed(
    () =>
      Boolean(this.form().vehicleType.trim()) && this.parsedUsages().length > 0,
  );

  protected updateForm<K extends keyof CreateVehicleUsageForm>(
    field: K,
    value: CreateVehicleUsageForm[K],
  ): void {
    this.form.update((current: CreateVehicleUsageForm) => ({
      ...current,
      [field]: value,
    }));
  }

  protected onSubmit(): void {
    if (!this.isValid() || this.creating()) {
      return;
    }
    const { vehicleType }: CreateVehicleUsageForm = this.form();
    this.create.emit({
      vehicleType,
      usages: this.parsedUsages(),
    });
  }

  protected onCancel(): void {
    if (this.creating()) {
      return;
    }
    this.closed.emit();
  }
}
