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
  EducationalLevelResponseDto,
  EducationalLevelsStore,
  EntityStatus,
  ExaminationBoardResponseDto,
  ExaminationBoardsStore,
  ExaminationResponseDto,
  ExaminationsStore,
  UpdateExaminationDto,
} from '@mushaviri/api';
import {
  NotificationService,
  StatusPillComponent,
  StatusTone,
} from '@mushaviri/ui';
import { ENTITY_STATUS_OPTIONS } from '../../../shared/types/common/entity-status-options.const';
import { ENTITY_STATUS_TONES } from '../../../shared/types/common/entity-status-tones.const';
import { SelectOption } from '../../../shared/types/common/select-option.type';
import { ExaminationForm } from '../../../shared/types/examinations/examination-form.type';

@Component({
  selector: 'org-examination-detail-drawer',
  standalone: true,
  imports: [DatePipe, FormsModule, RouterLink, StatusPillComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './examination-detail-drawer.component.html',
})
export class ExaminationDetailDrawerComponent {
  private readonly router: Router = inject(Router);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly store: InstanceType<typeof ExaminationsStore> =
    inject(ExaminationsStore);
  private readonly examinationBoardsStore: InstanceType<
    typeof ExaminationBoardsStore
  > = inject(ExaminationBoardsStore);
  private readonly educationalLevelsStore: InstanceType<
    typeof EducationalLevelsStore
  > = inject(EducationalLevelsStore);
  private readonly notificationService: NotificationService =
    inject(NotificationService);

  protected readonly statusOptions: SelectOption<EntityStatus>[] =
    ENTITY_STATUS_OPTIONS;

  public readonly examinationId: InputSignal<string> = input.required<string>();

  protected readonly saving: WritableSignal<boolean> = signal(false);
  private readonly editedForm: WritableSignal<ExaminationForm | null> =
    signal(null);

  protected readonly examinationsLoading: Signal<boolean> =
    this.store.examinationsLoading;
  protected readonly examinationBoards: Signal<ExaminationBoardResponseDto[]> =
    this.examinationBoardsStore.examinationBoards;

  protected readonly examination: Signal<ExaminationResponseDto | undefined> =
    computed<ExaminationResponseDto | undefined>(() =>
      this.store
        .examinations()
        .find(
          (examination: ExaminationResponseDto): boolean =>
            examination._id === this.examinationId(),
        ),
    );

  protected readonly statusTone: Signal<StatusTone> = computed<StatusTone>(
    () =>
      ENTITY_STATUS_TONES[this.examination()?.status ?? EntityStatus.ACTIVE] ??
      'info',
  );

  protected readonly formValue: Signal<ExaminationForm> =
    computed<ExaminationForm>(() => {
      const edited: ExaminationForm | null = this.editedForm();
      if (edited) {
        return edited;
      }
      const examination: ExaminationResponseDto | undefined =
        this.examination();
      return {
        examinationBoardId: examination?.examinationBoardId ?? '',
        educationalLevelId: examination?.educationalLevelId ?? '',
        name: examination?.name ?? '',
        qualification: examination?.qualification ?? '',
        description: examination?.description ?? '',
        status: examination?.status ?? EntityStatus.ACTIVE,
      };
    });

  protected readonly availableEducationalLevels: Signal<
    EducationalLevelResponseDto[]
  > = computed<EducationalLevelResponseDto[]>(() => {
    const examinationBoardId: string = this.formValue().examinationBoardId;
    return this.educationalLevelsStore
      .educationalLevels()
      .filter(
        (level: EducationalLevelResponseDto): boolean =>
          level.examinationBoardId === examinationBoardId,
      );
  });

  protected readonly isValid: Signal<boolean> = computed<boolean>(() => {
    const { examinationBoardId, educationalLevelId, name }: ExaminationForm =
      this.formValue();
    return (
      Boolean(examinationBoardId) &&
      Boolean(educationalLevelId) &&
      Boolean(name.trim())
    );
  });

  public constructor() {
    this.store.loadExaminations();
    this.examinationBoardsStore.loadExaminationBoards();
    this.educationalLevelsStore.loadEducationalLevels();
  }

  protected updateForm<K extends keyof ExaminationForm>(
    field: K,
    value: ExaminationForm[K],
  ): void {
    this.editedForm.set({
      ...this.formValue(),
      [field]: value,
      ...(field === 'examinationBoardId' ? { educationalLevelId: '' } : {}),
    });
  }

  protected saveExamination(): void {
    if (!this.isValid() || this.saving()) {
      return;
    }
    this.saving.set(true);
    const {
      examinationBoardId,
      educationalLevelId,
      name,
      qualification,
      description,
      status,
    }: ExaminationForm = this.formValue();
    const dto: UpdateExaminationDto = {
      examinationBoardId,
      educationalLevelId,
      name: name.trim(),
      qualification: qualification.trim(),
      description: description.trim(),
      status,
    };
    this.store.updateExamination(this.examinationId(), dto, {
      next: (): void => {
        this.saving.set(false);
        this.editedForm.set(null);
        this.notificationService.show({
          message: 'Examination updated successfully.',
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
