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
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  EducationalLevelsStore,
  EntityStatus,
  ExaminationPaperResponseDto,
  ExaminationPapersStore,
  ExaminationPaperType,
  SubjectsStore,
  UpdateExaminationPaperDto,
} from '@mushaviri/api';
import {
  NotificationService,
  StatusPillComponent,
  StatusTone,
} from '@mushaviri/ui';
import { ExaminationPaperFieldsComponent } from '../examination-paper-fields/examination-paper-fields.component';
import { ExaminationPaperForm } from '../../../shared/types/examination-papers/examination-paper-form.type';
import { isExaminationPaperFormValid } from '../../../shared/types/examination-papers/is-examination-paper-form-valid.const';
import { buildSubjectLevelLabels } from '../../../shared/types/examination-papers/build-subject-level-labels.const';
import { SelectOption } from '../../../shared/types/common/select-option.type';
import { ENTITY_STATUS_TONES } from '../../../shared/types/common/entity-status-tones.const';

@Component({
  selector: 'org-examination-paper-detail-drawer',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
    StatusPillComponent,
    ExaminationPaperFieldsComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './examination-paper-detail-drawer.component.html',
})
export class ExaminationPaperDetailDrawerComponent {
  private readonly router: Router = inject(Router);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly store: InstanceType<typeof ExaminationPapersStore> = inject(
    ExaminationPapersStore,
  );
  private readonly subjectsStore: InstanceType<typeof SubjectsStore> =
    inject(SubjectsStore);
  private readonly levelsStore: InstanceType<typeof EducationalLevelsStore> =
    inject(EducationalLevelsStore);
  private readonly notificationService: NotificationService =
    inject(NotificationService);

  protected readonly saving: WritableSignal<boolean> = signal(false);
  private readonly editedForm: WritableSignal<ExaminationPaperForm | null> =
    signal(null);

  public readonly paperId: InputSignal<string> = input.required<string>();

  protected readonly papersLoading: Signal<boolean> =
    this.store.examinationPapersLoading;

  protected readonly paper: Signal<ExaminationPaperResponseDto | undefined> =
    computed(() =>
      this.store
        .examinationPapers()
        .find(
          (paper: ExaminationPaperResponseDto) => paper._id === this.paperId(),
        ),
    );

  private readonly subjectLabelsById: Signal<Map<string, string>> = computed<
    Map<string, string>
  >(() =>
    buildSubjectLevelLabels(
      this.subjectsStore.subjects(),
      this.levelsStore.educationalLevels(),
    ),
  );

  protected readonly subjectOptions: Signal<SelectOption[]> = computed<
    SelectOption[]
  >(() =>
    Array.from(this.subjectLabelsById().entries())
      .map(([value, label]: [string, string]): SelectOption => ({
        value,
        label,
      }))
      .sort((a: SelectOption, b: SelectOption) =>
        a.label.localeCompare(b.label),
      ),
  );

  protected readonly subjectLabel: Signal<string> = computed<string>(() => {
    const subjectId: string = this.paper()?.subjectId ?? '';
    return this.subjectLabelsById().get(subjectId) ?? subjectId;
  });

  protected readonly statusTone: Signal<StatusTone> = computed<StatusTone>(
    () =>
      ENTITY_STATUS_TONES[this.paper()?.status ?? EntityStatus.ACTIVE] ??
      'info',
  );

  protected readonly formValue: Signal<ExaminationPaperForm> =
    computed<ExaminationPaperForm>(() => {
      const edited: ExaminationPaperForm | null = this.editedForm();
      if (edited) {
        return edited;
      }
      const paper: ExaminationPaperResponseDto | undefined = this.paper();
      return {
        subjectId: paper?.subjectId ?? '',
        name: paper?.name ?? '',
        description: paper?.description ?? '',
        type: paper?.type ?? '',
        numberOfQuestions: paper?.numberOfQuestions ?? null,
        duration: paper?.duration ?? null,
        marks: paper?.marks ?? null,
        status: paper?.status ?? EntityStatus.ACTIVE,
      };
    });

  protected readonly isValid: Signal<boolean> = computed<boolean>(() =>
    isExaminationPaperFormValid(this.formValue()),
  );

  protected readonly isDirty: Signal<boolean> = computed<boolean>(
    () => this.editedForm() !== null,
  );

  public constructor() {
    this.store.loadExaminationPapers();
    this.subjectsStore.loadSubjects();
    this.levelsStore.loadEducationalLevels();
  }

  protected updateForm(patch: Partial<ExaminationPaperForm>): void {
    this.editedForm.set({ ...this.formValue(), ...patch });
  }

  protected savePaper(): void {
    if (!this.isValid() || this.saving()) {
      return;
    }
    this.saving.set(true);
    const form: ExaminationPaperForm = this.formValue();
    const dto: UpdateExaminationPaperDto = {
      subjectId: form.subjectId,
      name: form.name.trim(),
      description: form.description.trim(),
      type: form.type as ExaminationPaperType,
      numberOfQuestions: Number(form.numberOfQuestions),
      duration: Number(form.duration),
      marks: Number(form.marks),
      status: form.status,
    };
    this.store.updateExaminationPaper(this.paperId(), dto, {
      next: (): void => {
        this.saving.set(false);
        this.editedForm.set(null);
        this.notificationService.show({
          message: 'Examination paper saved.',
          type: 'success',
        });
        this.close();
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
