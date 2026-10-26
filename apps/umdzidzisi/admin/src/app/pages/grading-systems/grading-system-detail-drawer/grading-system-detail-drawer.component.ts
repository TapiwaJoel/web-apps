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
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  EntityStatus,
  ExaminationResponseDto,
  ExaminationsStore,
  GradingScaleResponseDto,
  GradingScalesStore,
  GradingSystemResponseDto,
  GradingSystemsStore,
  UpdateGradingSystemDto,
} from '@mushaviri/api';
import {
  NotificationService,
  StatusPillComponent,
  StatusTone,
} from '@mushaviri/ui';
import { ENTITY_STATUS_OPTIONS } from '../../../shared/types/common/entity-status-options.const';
import { ENTITY_STATUS_TONES } from '../../../shared/types/common/entity-status-tones.const';
import { SelectOption } from '../../../shared/types/common/select-option.type';
import { GradingSystemForm } from '../../../shared/types/grading-systems/grading-system-form.type';
import { GradingScaleRangeBarComponent } from '../../grading-scales/grading-scale-range-bar/grading-scale-range-bar.component';

@Component({
  selector: 'org-grading-system-detail-drawer',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    RouterLink,
    StatusPillComponent,
    GradingScaleRangeBarComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './grading-system-detail-drawer.component.html',
})
export class GradingSystemDetailDrawerComponent {
  private readonly router: Router = inject(Router);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly store: InstanceType<typeof GradingSystemsStore> =
    inject(GradingSystemsStore);
  private readonly examinationsStore: InstanceType<typeof ExaminationsStore> =
    inject(ExaminationsStore);
  private readonly gradingScalesStore: InstanceType<typeof GradingScalesStore> =
    inject(GradingScalesStore);
  private readonly notificationService: NotificationService =
    inject(NotificationService);

  protected readonly statusOptions: SelectOption<EntityStatus>[] =
    ENTITY_STATUS_OPTIONS;

  public readonly gradingSystemId: InputSignal<string> =
    input.required<string>();

  protected readonly saving: WritableSignal<boolean> = signal(false);
  private readonly editedForm: WritableSignal<GradingSystemForm | null> =
    signal(null);

  protected readonly gradingSystemsLoading: Signal<boolean> =
    this.store.gradingSystemsLoading;
  protected readonly gradingScalesLoading: Signal<boolean> =
    this.gradingScalesStore.gradingScalesLoading;
  protected readonly examinations: Signal<ExaminationResponseDto[]> =
    this.examinationsStore.examinations;

  protected readonly gradingSystem: Signal<
    GradingSystemResponseDto | undefined
  > = computed<GradingSystemResponseDto | undefined>(() =>
    this.store
      .gradingSystems()
      .find(
        (system: GradingSystemResponseDto): boolean =>
          system._id === this.gradingSystemId(),
      ),
  );

  protected readonly scales: Signal<GradingScaleResponseDto[]> = computed<
    GradingScaleResponseDto[]
  >(() =>
    this.gradingScalesStore
      .gradingScales()
      .filter(
        (scale: GradingScaleResponseDto): boolean =>
          scale.gradingSystemId === this.gradingSystemId(),
      ),
  );

  protected readonly statusTone: Signal<StatusTone> = computed<StatusTone>(
    () =>
      ENTITY_STATUS_TONES[
        this.gradingSystem()?.status ?? EntityStatus.ACTIVE
      ] ?? 'info',
  );

  protected readonly formValue: Signal<GradingSystemForm> =
    computed<GradingSystemForm>(() => {
      const edited: GradingSystemForm | null = this.editedForm();
      if (edited) {
        return edited;
      }
      const system: GradingSystemResponseDto | undefined = this.gradingSystem();
      return {
        examinationId: system?.examinationId ?? '',
        name: system?.name ?? '',
        description: system?.description ?? '',
        status: system?.status ?? EntityStatus.ACTIVE,
      };
    });

  protected readonly isValid: Signal<boolean> = computed<boolean>(() => {
    const { examinationId, name }: GradingSystemForm = this.formValue();
    return Boolean(examinationId) && Boolean(name.trim());
  });

  public constructor() {
    this.store.loadGradingSystems();
    this.examinationsStore.loadExaminations();
    this.gradingScalesStore.loadGradingScales();
  }

  protected updateForm<K extends keyof GradingSystemForm>(
    field: K,
    value: GradingSystemForm[K],
  ): void {
    this.editedForm.set({ ...this.formValue(), [field]: value });
  }

  protected saveGradingSystem(): void {
    if (!this.isValid() || this.saving()) {
      return;
    }
    this.saving.set(true);
    const { examinationId, name, description, status }: GradingSystemForm =
      this.formValue();
    const dto: UpdateGradingSystemDto = {
      examinationId,
      name: name.trim(),
      description: description.trim(),
      status,
    };
    this.store.updateGradingSystem(this.gradingSystemId(), dto, {
      next: (): void => {
        this.saving.set(false);
        this.editedForm.set(null);
        this.notificationService.show({
          message: 'Grading system updated successfully.',
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
