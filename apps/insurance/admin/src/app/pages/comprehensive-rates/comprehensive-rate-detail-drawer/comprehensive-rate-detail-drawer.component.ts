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
  ComprehensiveRateResponseDto,
  ComprehensiveRatesStore,
  EntityStatus,
  UpdateComprehensiveRateDto,
  VehicleTypeResponseDto,
  VehicleTypesStore,
  VehicleUsageResponseDto,
  VehicleUsagesStore,
} from '@mushaviri/api';
import {
  NotificationService,
  StatusPillComponent,
  StatusTone,
  ENTITY_STATUS_TONES,
} from '@mushaviri/ui';

interface ComprehensiveRateForm {
  vehicleUsage: string;
  rate: number;
}

@Component({
  selector: 'org-comprehensive-rate-detail-drawer',
  standalone: true,
  imports: [DatePipe, FormsModule, StatusPillComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './comprehensive-rate-detail-drawer.component.html',
})
export class ComprehensiveRateDetailDrawerComponent {
  private readonly router: Router = inject(Router);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly store: InstanceType<typeof ComprehensiveRatesStore> = inject(
    ComprehensiveRatesStore,
  );
  private readonly vehicleTypesStore: InstanceType<typeof VehicleTypesStore> =
    inject(VehicleTypesStore);
  private readonly vehicleUsagesStore: InstanceType<typeof VehicleUsagesStore> =
    inject(VehicleUsagesStore);
  private readonly notificationService: NotificationService =
    inject(NotificationService);

  public readonly comprehensiveRateId: InputSignal<string> =
    input.required<string>();

  protected readonly comprehensiveRatesLoading: Signal<boolean> =
    this.store.comprehensiveRatesLoading;

  protected readonly comprehensiveRate: Signal<
    ComprehensiveRateResponseDto | undefined
  > = computed(() =>
    this.store
      .comprehensiveRates()
      .find(
        (comprehensiveRate: ComprehensiveRateResponseDto) =>
          comprehensiveRate._id === this.comprehensiveRateId(),
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
      this.vehicleTypeNamesById().get(
        this.comprehensiveRate()?.vehicleType ?? '',
      ) ??
      this.comprehensiveRate()?.vehicleType ??
      '',
  );

  protected readonly availableVehicleUsages: Signal<VehicleUsageResponseDto[]> =
    computed(() => {
      const vehicleType: string | undefined =
        this.comprehensiveRate()?.vehicleType;
      const allUsages: VehicleUsageResponseDto[] =
        this.vehicleUsagesStore.vehicleUsages();
      if (!vehicleType) {
        return allUsages;
      }
      return allUsages.filter(
        (vehicleUsage: VehicleUsageResponseDto) =>
          vehicleUsage.vehicleType === vehicleType,
      );
    });

  protected readonly statusTone: Signal<StatusTone> = computed(
    () =>
      ENTITY_STATUS_TONES[
        this.comprehensiveRate()?.status ?? EntityStatus.ACTIVE
      ] ?? 'info',
  );

  protected readonly saving: WritableSignal<boolean> = signal(false);

  private readonly editedForm: WritableSignal<ComprehensiveRateForm | null> =
    signal(null);

  protected readonly formValue: Signal<ComprehensiveRateForm> = computed(() => {
    const edited: ComprehensiveRateForm | null = this.editedForm();
    if (edited) {
      return edited;
    }
    const comprehensiveRate: ComprehensiveRateResponseDto | undefined =
      this.comprehensiveRate();
    return {
      vehicleUsage: comprehensiveRate?.vehicleUsage ?? '',
      rate: comprehensiveRate?.rate ?? 0,
    };
  });

  public constructor() {
    this.store.loadComprehensiveRates();
    this.vehicleTypesStore.loadVehicleTypes();
    this.vehicleUsagesStore.loadVehicleUsages();
  }

  protected updateForm<K extends keyof ComprehensiveRateForm>(
    field: K,
    value: ComprehensiveRateForm[K],
  ): void {
    this.editedForm.set({ ...this.formValue(), [field]: value });
  }

  protected saveComprehensiveRate(): void {
    this.saving.set(true);
    const { vehicleUsage, rate }: ComprehensiveRateForm = this.formValue();
    const dto: UpdateComprehensiveRateDto = { vehicleUsage, rate };
    this.store.updateComprehensiveRate(this.comprehensiveRateId(), dto, {
      next: (): void => {
        this.saving.set(false);
        this.editedForm.set(null);
        this.notificationService.show({
          message: 'Comprehensive rate updated successfully.',
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
