import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  InputSignal,
  OnInit,
  output,
  OutputEmitterRef,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ContentStatus,
  CreateSubjectDto,
  EducationalLevelResponseDto,
  ExaminationBoardResponseDto,
  SubjectType,
} from '@mushaviri/api';
import { CmsImagePickerComponent } from '../../../shared/components/cms-image-picker/cms-image-picker.component';
import { CreateSubjectForm } from '../../../shared/types/subjects/create-subject-form.type';
import { EMPTY_CREATE_SUBJECT_FORM } from '../../../shared/types/subjects/empty-create-subject-form.const';
import { SUBJECT_TYPE_OPTIONS } from '../../../shared/types/common/subject-type-options.const';
import { SelectOption } from '../../../shared/types/common/select-option.type';

@Component({
  selector: 'org-create-subject-dialog',
  standalone: true,
  imports: [FormsModule, CmsImagePickerComponent],
  templateUrl: './create-subject-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateSubjectDialogComponent implements OnInit {
  // State
  protected readonly subjectTypeOptions: SelectOption<SubjectType>[] =
    SUBJECT_TYPE_OPTIONS;

  protected readonly form: WritableSignal<CreateSubjectForm> = signal({
    ...EMPTY_CREATE_SUBJECT_FORM,
  });

  // Signal inputs
  public readonly examinationBoards: InputSignal<
    ExaminationBoardResponseDto[]
  > = input<ExaminationBoardResponseDto[]>([]);
  public readonly educationalLevels: InputSignal<
    EducationalLevelResponseDto[]
  > = input<EducationalLevelResponseDto[]>([]);
  /** Pre-selects the board when the list is filtered to one. */
  public readonly initialExaminationBoardId: InputSignal<string> =
    input<string>('');
  /** Pre-selects the level when the list is filtered to one. */
  public readonly initialEducationalLevelId: InputSignal<string> =
    input<string>('');
  public readonly creating: InputSignal<boolean> = input(false);

  // Signal outputs
  public readonly create: OutputEmitterRef<CreateSubjectDto> =
    output<CreateSubjectDto>();
  public readonly closed: OutputEmitterRef<void> = output<void>();

  // Computed signals
  /** Only levels belonging to the chosen board. */
  protected readonly availableLevels: Signal<EducationalLevelResponseDto[]> =
    computed<EducationalLevelResponseDto[]>(() => {
      const boardId: string = this.form().examinationBoardId;
      if (!boardId) {
        return [];
      }
      return this.educationalLevels().filter(
        (level: EducationalLevelResponseDto): boolean =>
          level.examinationBoardId === boardId,
      );
    });

  protected readonly isValid: Signal<boolean> = computed<boolean>(() => {
    const form: CreateSubjectForm = this.form();
    return (
      Boolean(form.examinationBoardId) &&
      Boolean(form.educationalLevelId) &&
      Boolean(form.name.trim()) &&
      Boolean(form.code.trim()) &&
      Boolean(form.subjectType) &&
      Boolean(form.image)
    );
  });

  // Lifecycle hooks
  public ngOnInit(): void {
    const boardId: string = this.initialExaminationBoardId();
    const levelId: string = this.initialEducationalLevelId();
    const level: EducationalLevelResponseDto | undefined =
      this.educationalLevels().find(
        (candidate: EducationalLevelResponseDto): boolean =>
          candidate._id === levelId,
      );
    // A level filter implies its board, even when no board filter is set.
    const resolvedBoardId: string = level?.examinationBoardId ?? boardId;
    this.form.update((current: CreateSubjectForm): CreateSubjectForm => ({
      ...current,
      examinationBoardId: resolvedBoardId,
      educationalLevelId:
        level && level.examinationBoardId === resolvedBoardId ? levelId : '',
    }));
  }

  // Public methods
  protected updateForm<K extends keyof CreateSubjectForm>(
    field: K,
    value: CreateSubjectForm[K],
  ): void {
    this.form.update((current: CreateSubjectForm): CreateSubjectForm => ({
      ...current,
      [field]: value,
      ...(field === 'examinationBoardId' ? { educationalLevelId: '' } : {}),
    }));
  }

  protected onSubmit(): void {
    if (!this.isValid() || this.creating()) {
      return;
    }
    const form: CreateSubjectForm = this.form();
    const description: string = form.description.trim();
    this.create.emit({
      examinationBoardId: form.examinationBoardId,
      educationalLevelId: form.educationalLevelId,
      name: form.name.trim(),
      code: form.code.trim(),
      subjectType: form.subjectType as SubjectType,
      image: form.image,
      status: ContentStatus.DRAFT,
      ...(description ? { description } : {}),
    });
  }

  protected onCancel(): void {
    if (this.creating()) {
      return;
    }
    this.closed.emit();
  }
}
