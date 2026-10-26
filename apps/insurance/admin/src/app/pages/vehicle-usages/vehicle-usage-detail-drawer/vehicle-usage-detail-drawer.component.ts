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
  UpdateVehicleUsageDto,
  VehicleTypeResponseDto,
  VehicleTypesStore,
  VehicleUsageResponseDto,
  VehicleUsagesStore,
} from '@mushaviri/api';
import { NotificationService, StatusPillComponent } from '@mushaviri/ui';
import { StatusTone } from '../../../shared/types/vehicle-usages/status-tone.type';
import { STATUS_TONES } from '../../../shared/types/vehicle-usages/status-tones.const';

interface VehicleUsageForm {
  usagesText: string;
}

@Component({
  selector: 'org-vehicle-usage-detail-drawer',
  standalone: true,
  imports: [DatePipe, FormsModule, StatusPillComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './vehicle-usage-detail-drawer.component.html',
})
export class VehicleUsageDetailDrawerComponent {
  private readonly router: Router = inject(Router);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly vehicleUsagesStore: InstanceType<typeof VehicleUsagesStore> =
    inject(VehicleUsagesStore);
  private readonly vehicleTypesStore: InstanceType<typeof VehicleTypesStore> =
    inject(VehicleTypesStore);
  private readonly notificationService: NotificationService =
    inject(NotificationService);

  public readonly vehicleUsageId: InputSignal<string> =
    input.required<string>();

  protected readonly vehicleUsagesLoading: Signal<boolean> =
    this.vehicleUsagesStore.vehicleUsagesLoading;

  protected readonly vehicleUsage: Signal<VehicleUsageResponseDto | undefined> =
    computed(() =>
      this.vehicleUsagesStore
        .vehicleUsages()
        .find(
          (vehicleUsage: VehicleUsageResponseDto) =>
            vehicleUsage._id === this.vehicleUsageId(),
        ),
    );

  private readonly vehicleTypeNamesById: Signal<Map<string, string>> = computed<
    Map<string, string>
  >(
    () =>
      new Map(
        this.vehicleTypesStore
          .vehicleTypes()
          .map((vehicleType: VehicleTypeResponseDto) => [
            vehicleType._id,
            vehicleType.name,
          ]),
      ),
  );

  protected readonly vehicleTypeName: Signal<string> = computed(
    () =>
      this.vehicleTypeNamesById().get(this.vehicleUsage()?.vehicleType ?? '') ??
      this.vehicleUsage()?.vehicleType ??
      '',
  );

  protected readonly statusTone: Signal<StatusTone> = computed(
    () =>
      STATUS_TONES[this.vehicleUsage()?.status ?? EntityStatus.ACTIVE] ??
      'info',
  );

  protected readonly saving: WritableSignal<boolean> = signal(false);

  private readonly editedForm: WritableSignal<VehicleUsageForm | null> =
    signal(null);

  protected readonly formValue: Signal<VehicleUsageForm> = computed(() => {
    const edited: VehicleUsageForm | null = this.editedForm();
    if (edited) {
      return edited;
    }
    const vehicleUsage: VehicleUsageResponseDto | undefined =
      this.vehicleUsage();
    return {
      usagesText: (vehicleUsage?.usages ?? []).join('\n'),
    };
  });

  public constructor() {
    this.vehicleUsagesStore.loadVehicleUsages();
    this.vehicleTypesStore.loadVehicleTypes();
  }

  protected updateForm<K extends keyof VehicleUsageForm>(
    field: K,
    value: VehicleUsageForm[K],
  ): void {
    this.editedForm.set({ ...this.formValue(), [field]: value });
  }

  protected saveVehicleUsage(): void {
    this.saving.set(true);
    const usages: string[] = this.formValue()
      .usagesText.split('\n')
      .map((usage: string) => usage.trim())
      .filter((usage: string) => usage.length > 0);
    const dto: UpdateVehicleUsageDto = { usages };
    this.vehicleUsagesStore.updateVehicleUsage(this.vehicleUsageId(), dto, {
      next: (): void => {
        this.saving.set(false);
        this.editedForm.set(null);
        this.notificationService.show({
          message: 'Vehicle usage updated successfully.',
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
