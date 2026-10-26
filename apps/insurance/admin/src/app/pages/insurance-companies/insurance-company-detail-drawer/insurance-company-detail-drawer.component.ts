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
  SystemUserResponseDto,
  UpdateInsuranceCompanyDto,
  UsersStore,
  INSURANCE_PATH,
} from '@mushaviri/api';
import {
  NotificationService,
  StatusPillComponent,
  StatusTone,
  ENTITY_STATUS_TONES,
} from '@mushaviri/ui';

interface InsuranceCompanyForm {
  commissionRate: number;
  marketingRate: number;
}

@Component({
  selector: 'org-insurance-company-detail-drawer',
  standalone: true,
  imports: [DatePipe, FormsModule, StatusPillComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './insurance-company-detail-drawer.component.html',
})
export class InsuranceCompanyDetailDrawerComponent {
  private readonly router: Router = inject(Router);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly store: InstanceType<typeof InsuranceCompaniesStore> = inject(
    InsuranceCompaniesStore,
  );
  private readonly usersStore: InstanceType<typeof UsersStore> =
    inject(UsersStore);
  private readonly notificationService: NotificationService =
    inject(NotificationService);

  public readonly insuranceCompanyId: InputSignal<string> =
    input.required<string>();

  protected readonly insuranceCompaniesLoading: Signal<boolean> =
    this.store.insuranceCompaniesLoading;

  protected readonly insuranceCompany: Signal<
    InsuranceCompanyResponseDto | undefined
  > = computed(() =>
    this.store
      .insuranceCompanies()
      .find(
        (insuranceCompany: InsuranceCompanyResponseDto) =>
          insuranceCompany._id === this.insuranceCompanyId(),
      ),
  );

  protected readonly linkedUser: Signal<SystemUserResponseDto | undefined> =
    computed(() => {
      const systemUserId: string | undefined =
        this.insuranceCompany()?.systemUserId;
      if (!systemUserId) {
        return undefined;
      }
      return this.usersStore
        .users()
        .find((user: SystemUserResponseDto) => user._id === systemUserId);
    });

  protected readonly statusTone: Signal<StatusTone> = computed(
    () =>
      ENTITY_STATUS_TONES[
        this.insuranceCompany()?.status ?? EntityStatus.ACTIVE
      ] ?? 'info',
  );

  protected readonly saving: WritableSignal<boolean> = signal(false);

  private readonly editedForm: WritableSignal<InsuranceCompanyForm | null> =
    signal(null);

  protected readonly formValue: Signal<InsuranceCompanyForm> = computed(() => {
    const edited: InsuranceCompanyForm | null = this.editedForm();
    if (edited) {
      return edited;
    }
    const insuranceCompany: InsuranceCompanyResponseDto | undefined =
      this.insuranceCompany();
    return {
      commissionRate: insuranceCompany?.commissionRate ?? 0,
      marketingRate: insuranceCompany?.marketingRate ?? 0,
    };
  });

  protected readonly combinedRate: Signal<number> = computed(
    () => this.formValue().commissionRate + this.formValue().marketingRate,
  );

  protected readonly exceedsCombinedLimit: Signal<boolean> = computed(
    () => this.combinedRate() > 100,
  );

  protected readonly isValid: Signal<boolean> = computed(() => {
    const { commissionRate, marketingRate }: InsuranceCompanyForm =
      this.formValue();
    return (
      Number.isFinite(commissionRate) &&
      commissionRate >= 0 &&
      commissionRate <= 100 &&
      Number.isFinite(marketingRate) &&
      marketingRate >= 0 &&
      marketingRate <= 100 &&
      commissionRate + marketingRate <= 100
    );
  });

  public constructor() {
    this.store.loadInsuranceCompanies();
    this.usersStore.loadUsers({ serviceName: INSURANCE_PATH });
  }

  protected updateForm<K extends keyof InsuranceCompanyForm>(
    field: K,
    value: InsuranceCompanyForm[K],
  ): void {
    this.editedForm.set({ ...this.formValue(), [field]: value });
  }

  protected onRateChange(
    field: 'commissionRate' | 'marketingRate',
    value: string,
  ): void {
    const rate: number = Number(value);
    this.updateForm(field, Number.isFinite(rate) ? rate : 0);
  }

  protected saveInsuranceCompany(): void {
    if (!this.isValid()) {
      return;
    }
    this.saving.set(true);
    const { commissionRate, marketingRate }: InsuranceCompanyForm =
      this.formValue();
    const dto: UpdateInsuranceCompanyDto = { commissionRate, marketingRate };
    this.store.updateInsuranceCompany(this.insuranceCompanyId(), dto, {
      next: (): void => {
        this.saving.set(false);
        this.editedForm.set(null);
        this.notificationService.show({
          message: 'Insurance company updated successfully.',
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
