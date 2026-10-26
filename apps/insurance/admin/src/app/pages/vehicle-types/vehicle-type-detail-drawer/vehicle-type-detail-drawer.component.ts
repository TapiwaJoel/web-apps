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
  UpdateVehicleTypeDto,
  VehicleTypeResponseDto,
  VehicleTypesStore,
} from '@mushaviri/api';
import { NotificationService, StatusPillComponent } from '@mushaviri/ui';
import { StatusTone } from '../../../shared/types/vehicle-types/status-tone.type';
import { STATUS_TONES } from '../../../shared/types/vehicle-types/status-tones.const';

interface VehicleTypeForm {
  name: string;
  description: string;
}

@Component({
  selector: 'org-vehicle-type-detail-drawer',
  standalone: true,
  imports: [DatePipe, FormsModule, StatusPillComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './vehicle-type-detail-drawer.component.html',
})
export class VehicleTypeDetailDrawerComponent {
  private readonly router: Router = inject(Router);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly vehicleTypesStore: InstanceType<typeof VehicleTypesStore> =
    inject(VehicleTypesStore);
  private readonly notificationService: NotificationService =
    inject(NotificationService);

  public readonly vehicleTypeId: InputSignal<string> = input.required<string>();

  protected readonly vehicleTypesLoading: Signal<boolean> =
    this.vehicleTypesStore.vehicleTypesLoading;

  protected readonly vehicleType: Signal<VehicleTypeResponseDto | undefined> =
    computed(() =>
      this.vehicleTypesStore
        .vehicleTypes()
        .find(
          (vehicleType: VehicleTypeResponseDto) =>
            vehicleType._id === this.vehicleTypeId(),
        ),
    );

  protected readonly statusTone: Signal<StatusTone> = computed(
    () =>
      STATUS_TONES[this.vehicleType()?.status ?? EntityStatus.ACTIVE] ?? 'info',
  );

  protected readonly saving: WritableSignal<boolean> = signal(false);

  private readonly editedForm: WritableSignal<VehicleTypeForm | null> =
    signal(null);

  protected readonly formValue: Signal<VehicleTypeForm> = computed(() => {
    const edited: VehicleTypeForm | null = this.editedForm();
    if (edited) {
      return edited;
    }
    const vehicleType: VehicleTypeResponseDto | undefined = this.vehicleType();
    return {
      name: vehicleType?.name ?? '',
      description: vehicleType?.description ?? '',
    };
  });

  public constructor() {
    this.vehicleTypesStore.loadVehicleTypes();
  }

  protected updateForm<K extends keyof VehicleTypeForm>(
    field: K,
    value: VehicleTypeForm[K],
  ): void {
    this.editedForm.set({ ...this.formValue(), [field]: value });
  }

  protected saveVehicleType(): void {
    this.saving.set(true);
    const { name, description }: VehicleTypeForm = this.formValue();
    const dto: UpdateVehicleTypeDto = { name, description };
    this.vehicleTypesStore.updateVehicleType(this.vehicleTypeId(), dto, {
      next: (): void => {
        this.saving.set(false);
        this.editedForm.set(null);
        this.notificationService.show({
          message: 'Vehicle type updated successfully.',
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
