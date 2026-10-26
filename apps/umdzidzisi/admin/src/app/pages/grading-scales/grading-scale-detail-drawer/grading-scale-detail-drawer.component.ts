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
  GradingScaleResponseDto,
  GradingScalesStore,
  GradingSystemResponseDto,
  GradingSystemsStore,
  UpdateGradingScaleDto,
} from '@mushaviri/api';
import {
  NotificationService,
  StatusPillComponent,
  StatusTone,
} from '@mushaviri/ui';
import { ENTITY_STATUS_TONES } from '../../../shared/types/common/entity-status-tones.const';
import { GradingScaleForm } from '../../../shared/types/grading-scales/grading-scale-form.type';
import { GradingScaleRangeBarComponent } from '../grading-scale-range-bar/grading-scale-range-bar.component';
import { validateGradingScale } from '../validate-grading-scale.util';
import { previewGradingScales } from '../grading-scale-preview.util';

@Component({
  selector: 'org-grading-scale-detail-drawer',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    StatusPillComponent,
    GradingScaleRangeBarComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './grading-scale-detail-drawer.component.html',
})
export class GradingScaleDetailDrawerComponent {
  private readonly router: Router = inject(Router);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly store: InstanceType<typeof GradingScalesStore> =
    inject(GradingScalesStore);
  private readonly gradingSystemsStore: InstanceType<
    typeof GradingSystemsStore
  > = inject(GradingSystemsStore);
  private readonly notificationService: NotificationService =
    inject(NotificationService);

  public readonly gradingScaleId: InputSignal<string> =
    input.required<string>();

  protected readonly saving: WritableSignal<boolean> = signal(false);
  private readonly editedForm: WritableSignal<GradingScaleForm | null> =
    signal(null);

  protected readonly gradingScalesLoading: Signal<boolean> =
    this.store.gradingScalesLoading;
  protected readonly gradingSystems: Signal<GradingSystemResponseDto[]> =
    this.gradingSystemsStore.gradingSystems;

  protected readonly gradingScale: Signal<GradingScaleResponseDto | undefined> =
    computed(() =>
      this.store
        .gradingScales()
        .find(
          (scale: GradingScaleResponseDto): boolean =>
            scale._id === this.gradingScaleId(),
        ),
    );

  protected readonly statusTone: Signal<StatusTone> = computed<StatusTone>(
    () =>
      ENTITY_STATUS_TONES[this.gradingScale()?.status ?? EntityStatus.ACTIVE] ??
      'info',
  );

  protected readonly formValue: Signal<GradingScaleForm> =
    computed<GradingScaleForm>(() => {
      const edited: GradingScaleForm | null = this.editedForm();
      if (edited) {
        return edited;
      }
      const scale: GradingScaleResponseDto | undefined = this.gradingScale();
      return {
        gradingSystemId: scale?.gradingSystemId ?? '',
        symbol: scale?.symbol ?? '',
        minimumScore: scale?.minimumScore ?? null,
        maximumScore: scale?.maximumScore ?? null,
        description: scale?.description ?? '',
        order: scale?.order ?? 1,
      };
    });

  protected readonly formError: Signal<string | null> = computed<string | null>(
    () =>
      validateGradingScale(
        this.formValue(),
        this.store.gradingScales(),
        this.gradingScaleId(),
      ),
  );

  protected readonly previewScales: Signal<GradingScaleResponseDto[]> =
    computed<GradingScaleResponseDto[]>(() =>
      previewGradingScales(
        this.formValue(),
        this.store.gradingScales(),
        this.gradingScaleId(),
      ),
    );

  public constructor() {
    this.store.loadGradingScales();
    this.gradingSystemsStore.loadGradingSystems();
  }

  protected updateForm<K extends keyof GradingScaleForm>(
    field: K,
    value: GradingScaleForm[K],
  ): void {
    this.editedForm.set({ ...this.formValue(), [field]: value });
  }

  protected saveGradingScale(): void {
    if (this.formError() || this.saving()) {
      return;
    }
    this.saving.set(true);
    const {
      gradingSystemId,
      symbol,
      minimumScore,
      maximumScore,
      description,
      order,
    }: GradingScaleForm = this.formValue();
    const dto: UpdateGradingScaleDto = {
      gradingSystemId,
      symbol: symbol.trim(),
      minimumScore: minimumScore ?? undefined,
      maximumScore: maximumScore ?? undefined,
      description: description.trim(),
      order: order ?? undefined,
    };
    this.store.updateGradingScale(this.gradingScaleId(), dto, {
      next: (): void => {
        this.saving.set(false);
        this.editedForm.set(null);
        this.notificationService.show({
          message: 'Grading scale updated successfully.',
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
    this.router.navigate(['../'], {
      relativeTo: this.route,
      queryParamsHandling: 'preserve',
    });
  }
}
