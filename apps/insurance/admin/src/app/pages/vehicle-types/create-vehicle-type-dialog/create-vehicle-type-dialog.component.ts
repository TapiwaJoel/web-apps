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
import { CreateVehicleTypeDto } from '@mushaviri/api';
import {
  CreateVehicleTypeForm,
  EMPTY_FORM,
} from '../../../shared/types/vehicle-types/create-vehicle-type-dialog.types';

@Component({
  selector: 'org-create-vehicle-type-dialog',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './create-vehicle-type-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateVehicleTypeDialogComponent {
  public readonly creating: InputSignal<boolean> = input(false);

  public readonly create: OutputEmitterRef<CreateVehicleTypeDto> =
    output<CreateVehicleTypeDto>();
  public readonly closed: OutputEmitterRef<void> = output<void>();

  protected readonly form: WritableSignal<CreateVehicleTypeForm> = signal({
    ...EMPTY_FORM,
  });

  protected readonly isValid: Signal<boolean> = computed(() =>
    Boolean(this.form().name.trim()),
  );

  protected updateForm<K extends keyof CreateVehicleTypeForm>(
    field: K,
    value: CreateVehicleTypeForm[K],
  ): void {
    this.form.update((current: CreateVehicleTypeForm) => ({
      ...current,
      [field]: value,
    }));
  }

  protected onSubmit(): void {
    if (!this.isValid() || this.creating()) {
      return;
    }
    const { name, description }: CreateVehicleTypeForm = this.form();
    this.create.emit({
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
