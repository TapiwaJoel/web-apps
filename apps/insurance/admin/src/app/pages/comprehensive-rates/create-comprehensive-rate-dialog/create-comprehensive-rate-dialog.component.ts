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
  CreateComprehensiveRateDto,
  VehicleTypeResponseDto,
  VehicleUsageResponseDto,
} from '@mushaviri/api';
import {
  CreateComprehensiveRateForm,
  EMPTY_FORM,
} from '../../../shared/types/comprehensive-rates/create-comprehensive-rate-dialog.types';

@Component({
  selector: 'org-create-comprehensive-rate-dialog',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './create-comprehensive-rate-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateComprehensiveRateDialogComponent {
  public readonly vehicleTypes: InputSignal<VehicleTypeResponseDto[]> = input<
    VehicleTypeResponseDto[]
  >([]);
  public readonly vehicleUsages: InputSignal<VehicleUsageResponseDto[]> = input<
    VehicleUsageResponseDto[]
  >([]);
  public readonly creating: InputSignal<boolean> = input(false);

  public readonly create: OutputEmitterRef<CreateComprehensiveRateDto> =
    output<CreateComprehensiveRateDto>();
  public readonly closed: OutputEmitterRef<void> = output<void>();

  protected readonly form: WritableSignal<CreateComprehensiveRateForm> = signal(
    { ...EMPTY_FORM },
  );

  protected readonly availableVehicleUsages: Signal<VehicleUsageResponseDto[]> =
    computed(() => {
      const vehicleType: string = this.form().vehicleType;
      if (!vehicleType) {
        return this.vehicleUsages();
      }
      return this.vehicleUsages().filter(
        (vehicleUsage: VehicleUsageResponseDto) =>
          vehicleUsage.vehicleType === vehicleType,
      );
    });

  protected readonly isValid: Signal<boolean> = computed(() => {
    const { vehicleType, vehicleUsage, rate }: CreateComprehensiveRateForm =
      this.form();
    return (
      Boolean(vehicleType.trim()) &&
      Boolean(vehicleUsage.trim()) &&
      Number.isFinite(rate) &&
      rate >= 0 &&
      rate <= 100
    );
  });

  protected updateForm<K extends keyof CreateComprehensiveRateForm>(
    field: K,
    value: CreateComprehensiveRateForm[K],
  ): void {
    this.form.update((current: CreateComprehensiveRateForm) => ({
      ...current,
      [field]: value,
      ...(field === 'vehicleType' ? { vehicleUsage: '' } : {}),
    }));
  }

  protected onSubmit(): void {
    if (!this.isValid() || this.creating()) {
      return;
    }
    const { vehicleType, vehicleUsage, rate }: CreateComprehensiveRateForm =
      this.form();
    this.create.emit({ vehicleType, vehicleUsage, rate });
  }

  protected onCancel(): void {
    if (this.creating()) {
      return;
    }
    this.closed.emit();
  }
}
