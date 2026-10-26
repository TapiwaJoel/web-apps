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
  CreateExaminationDto,
  EducationalLevelResponseDto,
  ExaminationBoardResponseDto,
} from '@mushaviri/api';
import { CreateExaminationForm } from '../../../shared/types/examinations/create-examination-form.type';
import { EMPTY_CREATE_EXAMINATION_FORM } from '../../../shared/types/examinations/empty-create-examination-form.const';

@Component({
  selector: 'org-create-examination-dialog',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './create-examination-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateExaminationDialogComponent implements OnInit {
  public readonly examinationBoards: InputSignal<
    ExaminationBoardResponseDto[]
  > = input<ExaminationBoardResponseDto[]>([]);
  public readonly educationalLevels: InputSignal<
    EducationalLevelResponseDto[]
  > = input<EducationalLevelResponseDto[]>([]);
  /** Pre-selects a board/level, e.g. when the list is filtered to one. */
  public readonly initialExaminationBoardId: InputSignal<string> = input('');
  public readonly initialEducationalLevelId: InputSignal<string> = input('');
  public readonly creating: InputSignal<boolean> = input(false);

  public readonly create: OutputEmitterRef<CreateExaminationDto> =
    output<CreateExaminationDto>();
  public readonly closed: OutputEmitterRef<void> = output<void>();

  protected readonly form: WritableSignal<CreateExaminationForm> = signal({
    ...EMPTY_CREATE_EXAMINATION_FORM,
  });

  /** Levels belong to a board, so only the chosen board's levels are offered. */
  protected readonly availableEducationalLevels: Signal<
    EducationalLevelResponseDto[]
  > = computed<EducationalLevelResponseDto[]>(() => {
    const examinationBoardId: string = this.form().examinationBoardId;
    return examinationBoardId
      ? this.educationalLevels().filter(
          (level: EducationalLevelResponseDto): boolean =>
            level.examinationBoardId === examinationBoardId,
        )
      : [];
  });

  protected readonly isValid: Signal<boolean> = computed<boolean>(() => {
    const {
      examinationBoardId,
      educationalLevelId,
      name,
    }: CreateExaminationForm = this.form();
    return (
      Boolean(examinationBoardId) &&
      Boolean(educationalLevelId) &&
      Boolean(name.trim())
    );
  });

  public ngOnInit(): void {
    const levelId: string = this.initialEducationalLevelId();
    const level: EducationalLevelResponseDto | undefined =
      this.educationalLevels().find(
        (candidate: EducationalLevelResponseDto): boolean =>
          candidate._id === levelId,
      );
    const boardId: string =
      this.initialExaminationBoardId() || level?.examinationBoardId || '';
    if (boardId) {
      this.updateForm('examinationBoardId', boardId);
    }
    if (level && level.examinationBoardId === boardId) {
      this.updateForm('educationalLevelId', level._id);
    }
  }

  protected updateForm<K extends keyof CreateExaminationForm>(
    field: K,
    value: CreateExaminationForm[K],
  ): void {
    this.form.update(
      (current: CreateExaminationForm): CreateExaminationForm => ({
        ...current,
        [field]: value,
        ...(field === 'examinationBoardId' ? { educationalLevelId: '' } : {}),
      }),
    );
  }

  protected onSubmit(): void {
    if (!this.isValid() || this.creating()) {
      return;
    }
    const {
      examinationBoardId,
      educationalLevelId,
      name,
      qualification,
      description,
    }: CreateExaminationForm = this.form();
    this.create.emit({
      examinationBoardId,
      educationalLevelId,
      name: name.trim(),
      qualification: qualification.trim() || undefined,
      description: description.trim() || undefined,
    });
  }

  protected onCancel(): void {
    if (this.creating()) {
      return;
    }
    this.closed.emit();
  }
}
