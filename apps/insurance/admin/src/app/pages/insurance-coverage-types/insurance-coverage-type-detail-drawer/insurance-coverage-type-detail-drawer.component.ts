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
  InsuranceCompaniesStore,
  InsuranceCompanyResponseDto,
  InsuranceCoverageTypeResponseDto,
  InsuranceCoverageTypesStore,
  SystemUserResponseDto,
  UpdateInsuranceCoverageTypeDto,
  UsersStore,
  INSURANCE_PATH,
} from '@mushaviri/api';
import { NotificationService, StatusPillComponent } from '@mushaviri/ui';
import { StatusTone } from '../../../shared/types/insurance-coverage-types/status-tone.type';
import { STATUS_TONES } from '../../../shared/types/insurance-coverage-types/status-tones.const';

interface InsuranceCoverageTypeForm {
  name: string;
  description: string;
}

@Component({
  selector: 'org-insurance-coverage-type-detail-drawer',
  standalone: true,
  imports: [DatePipe, FormsModule, StatusPillComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './insurance-coverage-type-detail-drawer.component.html',
})
export class InsuranceCoverageTypeDetailDrawerComponent {
  private readonly router: Router = inject(Router);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly store: InstanceType<typeof InsuranceCoverageTypesStore> =
    inject(InsuranceCoverageTypesStore);
  private readonly insuranceCompaniesStore: InstanceType<
    typeof InsuranceCompaniesStore
  > = inject(InsuranceCompaniesStore);
  private readonly usersStore: InstanceType<typeof UsersStore> =
    inject(UsersStore);
  private readonly notificationService: NotificationService =
    inject(NotificationService);

  public readonly insuranceCoverageTypeId: InputSignal<string> =
    input.required<string>();

  protected readonly insuranceCoverageTypesLoading: Signal<boolean> =
    this.store.insuranceCoverageTypesLoading;

  protected readonly insuranceCoverageType: Signal<
    InsuranceCoverageTypeResponseDto | undefined
  > = computed(() =>
    this.store
      .insuranceCoverageTypes()
      .find(
        (insuranceCoverageType: InsuranceCoverageTypeResponseDto) =>
          insuranceCoverageType._id === this.insuranceCoverageTypeId(),
      ),
  );

  /**
   * Same two-hop resolution as the list page: insuranceCompany id ->
   * InsuranceCompanyResponseDto -> systemUserId -> SystemUserResponseDto.name.
   */
  private readonly insuranceCompanyLabelById: Signal<Map<string, string>> =
    computed<Map<string, string>>(() => {
      const userNamesById: Map<string, string> = new Map(
        this.usersStore
          .users()
          .map((user: SystemUserResponseDto) => [user._id, user.name]),
      );
      return new Map(
        this.insuranceCompaniesStore
          .insuranceCompanies()
          .map((insuranceCompany: InsuranceCompanyResponseDto) => [
            insuranceCompany._id,
            userNamesById.get(insuranceCompany.systemUserId) ??
              insuranceCompany._id,
          ]),
      );
    });

  protected readonly insuranceCompanyLabel: Signal<string> = computed(
    () =>
      this.insuranceCompanyLabelById().get(
        this.insuranceCoverageType()?.insuranceCompany ?? '',
      ) ??
      this.insuranceCoverageType()?.insuranceCompany ??
      '',
  );

  protected readonly statusTone: Signal<StatusTone> = computed(
    () =>
      STATUS_TONES[
        this.insuranceCoverageType()?.status ?? EntityStatus.ACTIVE
      ] ?? 'info',
  );

  protected readonly saving: WritableSignal<boolean> = signal(false);

  private readonly editedForm: WritableSignal<InsuranceCoverageTypeForm | null> =
    signal(null);

  protected readonly formValue: Signal<InsuranceCoverageTypeForm> = computed(
    () => {
      const edited: InsuranceCoverageTypeForm | null = this.editedForm();
      if (edited) {
        return edited;
      }
      const insuranceCoverageType:
        InsuranceCoverageTypeResponseDto | undefined =
        this.insuranceCoverageType();
      return {
        name: insuranceCoverageType?.name ?? '',
        description: insuranceCoverageType?.description ?? '',
      };
    },
  );

  public constructor() {
    this.store.loadInsuranceCoverageTypes();
    this.insuranceCompaniesStore.loadInsuranceCompanies();
    this.usersStore.loadUsers({ serviceName: INSURANCE_PATH });
  }

  protected updateForm<K extends keyof InsuranceCoverageTypeForm>(
    field: K,
    value: InsuranceCoverageTypeForm[K],
  ): void {
    this.editedForm.set({ ...this.formValue(), [field]: value });
  }

  protected saveInsuranceCoverageType(): void {
    this.saving.set(true);
    const { name, description }: InsuranceCoverageTypeForm = this.formValue();
    const dto: UpdateInsuranceCoverageTypeDto = {
      name,
      description: description.trim() || undefined,
    };
    this.store.updateInsuranceCoverageType(
      this.insuranceCoverageTypeId(),
      dto,
      {
        next: (): void => {
          this.saving.set(false);
          this.editedForm.set(null);
          this.notificationService.show({
            message: 'Insurance coverage type updated successfully.',
            type: 'success',
          });
        },
        error: (message: string): void => {
          this.saving.set(false);
          this.notificationService.show({ message, type: 'error' });
        },
      },
    );
  }

  protected close(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
