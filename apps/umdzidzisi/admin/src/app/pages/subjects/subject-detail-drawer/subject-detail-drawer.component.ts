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
  ContentStatus,
  EducationalLevelResponseDto,
  EducationalLevelsStore,
  ExaminationBoardResponseDto,
  ExaminationBoardsStore,
  SubjectResponseDto,
  SubjectsStore,
  SubjectType,
  UpdateSubjectDto,
} from '@mushaviri/api';
import {
  NotificationService,
  StatusPillComponent,
  StatusTone,
} from '@mushaviri/ui';
import { CmsImagePickerComponent } from '../../../shared/components/cms-image-picker/cms-image-picker.component';
import { SubjectForm } from '../../../shared/types/subjects/subject-form.type';
import { CONTENT_STATUS_OPTIONS } from '../../../shared/types/common/content-status-options.const';
import { CONTENT_STATUS_TONES } from '../../../shared/types/common/content-status-tones.const';
import { SUBJECT_TYPE_OPTIONS } from '../../../shared/types/common/subject-type-options.const';
import { SelectOption } from '../../../shared/types/common/select-option.type';

@Component({
  selector: 'org-subject-detail-drawer',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    RouterLink,
    StatusPillComponent,
    CmsImagePickerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './subject-detail-drawer.component.html',
})
export class SubjectDetailDrawerComponent {
  // Injected services
  private readonly router: Router = inject(Router);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly store: InstanceType<typeof SubjectsStore> =
    inject(SubjectsStore);
  private readonly educationalLevelsStore: InstanceType<
    typeof EducationalLevelsStore
  > = inject(EducationalLevelsStore);
  private readonly examinationBoardsStore: InstanceType<
    typeof ExaminationBoardsStore
  > = inject(ExaminationBoardsStore);
  private readonly notificationService: NotificationService =
    inject(NotificationService);

  // State
  protected readonly statusOptions: SelectOption<ContentStatus>[] =
    CONTENT_STATUS_OPTIONS;
  protected readonly subjectTypeOptions: SelectOption<SubjectType>[] =
    SUBJECT_TYPE_OPTIONS;
  /**
   * The `curriculum` section route. Child-list links resolve against it
   * (`topics` → `curriculum/topics`, `../examinations/papers`), which is
   * independent of whether this page sits at `subjects` or `subjects/:id`.
   */
  protected readonly curriculumRoute: ActivatedRoute | null = this.route.parent;

  protected readonly subjectsLoading: Signal<boolean> =
    this.store.subjectsLoading;
  protected readonly examinationBoards: Signal<ExaminationBoardResponseDto[]> =
    this.examinationBoardsStore.examinationBoards;
  protected readonly saving: WritableSignal<boolean> = signal(false);

  private readonly editedForm: WritableSignal<SubjectForm | null> =
    signal(null);

  // Signal inputs
  public readonly subjectId: InputSignal<string> = input.required<string>();

  // Computed signals
  protected readonly subject: Signal<SubjectResponseDto | undefined> = computed<
    SubjectResponseDto | undefined
  >(() =>
    this.store
      .subjects()
      .find(
        (subject: SubjectResponseDto): boolean =>
          subject._id === this.subjectId(),
      ),
  );

  protected readonly statusTone: Signal<StatusTone> = computed<StatusTone>(
    () => CONTENT_STATUS_TONES[this.subject()?.status ?? ContentStatus.DRAFT],
  );

  protected readonly formValue: Signal<SubjectForm> = computed<SubjectForm>(
    () => {
      const edited: SubjectForm | null = this.editedForm();
      if (edited) {
        return edited;
      }
      const subject: SubjectResponseDto | undefined = this.subject();
      return {
        examinationBoardId: subject?.examinationBoardId ?? '',
        educationalLevelId: subject?.educationalLevelId ?? '',
        name: subject?.name ?? '',
        code: subject?.code ?? '',
        subjectType: subject?.subjectType ?? SubjectType.ACADEMIC,
        description: subject?.description ?? '',
        image: subject?.image ?? '',
        status: subject?.status ?? ContentStatus.DRAFT,
      };
    },
  );

  /** Only levels belonging to the chosen board. */
  protected readonly availableLevels: Signal<EducationalLevelResponseDto[]> =
    computed<EducationalLevelResponseDto[]>(() => {
      const boardId: string = this.formValue().examinationBoardId;
      return this.educationalLevelsStore
        .educationalLevels()
        .filter(
          (level: EducationalLevelResponseDto): boolean =>
            level.examinationBoardId === boardId,
        );
    });

  protected readonly isDirty: Signal<boolean> = computed<boolean>(
    () => this.editedForm() !== null,
  );

  protected readonly isValid: Signal<boolean> = computed<boolean>(() => {
    const form: SubjectForm = this.formValue();
    return (
      Boolean(form.examinationBoardId) &&
      Boolean(form.educationalLevelId) &&
      Boolean(form.name.trim()) &&
      Boolean(form.code.trim()) &&
      Boolean(form.subjectType) &&
      Boolean(form.image)
    );
  });

  public constructor() {
    this.store.loadSubjects();
    this.educationalLevelsStore.loadEducationalLevels();
    this.examinationBoardsStore.loadExaminationBoards();
  }

  // Public methods
  protected updateForm<K extends keyof SubjectForm>(
    field: K,
    value: SubjectForm[K],
  ): void {
    this.editedForm.set({
      ...this.formValue(),
      [field]: value,
      ...(field === 'examinationBoardId' ? { educationalLevelId: '' } : {}),
    });
  }

  protected saveSubject(): void {
    if (!this.isValid() || this.saving()) {
      return;
    }
    this.saving.set(true);
    const form: SubjectForm = this.formValue();
    const dto: UpdateSubjectDto = {
      examinationBoardId: form.examinationBoardId,
      educationalLevelId: form.educationalLevelId,
      name: form.name.trim(),
      code: form.code.trim(),
      subjectType: form.subjectType,
      description: form.description.trim(),
      image: form.image,
      status: form.status,
    };
    this.store.updateSubject(this.subjectId(), dto, {
      next: (): void => {
        this.saving.set(false);
        this.editedForm.set(null);
        this.notificationService.show({
          message: 'Subject saved.',
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
