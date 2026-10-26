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
  CreateEducationalLevelDto,
  EducationalLevelResponseDto,
  ExaminationBoardResponseDto,
} from '@mushaviri/api';
import { CreateEducationalLevelForm } from '../../../shared/types/educational-levels/create-educational-level-form.type';
import { EMPTY_CREATE_EDUCATIONAL_LEVEL_FORM } from '../../../shared/types/educational-levels/empty-create-educational-level-form.const';

@Component({
  selector: 'org-create-educational-level-dialog',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './create-educational-level-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateEducationalLevelDialogComponent implements OnInit {
  public readonly creating: InputSignal<boolean> = input(false);
  public readonly examinationBoards: InputSignal<
    ExaminationBoardResponseDto[]
  > = input<ExaminationBoardResponseDto[]>([]);
  /** Existing levels, used to flag a duplicate (name, board) pair before submit. */
  public readonly educationalLevels: InputSignal<
    EducationalLevelResponseDto[]
  > = input<EducationalLevelResponseDto[]>([]);
  /** Pre-selects a board, e.g. when the list is filtered to one. */
  public readonly initialExaminationBoardId: InputSignal<string> =
    input<string>('');

  public readonly create: OutputEmitterRef<CreateEducationalLevelDto> =
    output<CreateEducationalLevelDto>();
  public readonly closed: OutputEmitterRef<void> = output<void>();

  protected readonly form: WritableSignal<CreateEducationalLevelForm> = signal({
    ...EMPTY_CREATE_EDUCATIONAL_LEVEL_FORM,
  });

  protected readonly isDuplicate: Signal<boolean> = computed(() => {
    const { name, examinationBoardId }: CreateEducationalLevelForm =
      this.form();
    const normalized: string = name.trim().toLowerCase();
    if (!normalized || !examinationBoardId) {
      return false;
    }
    return this.educationalLevels().some(
      (level: EducationalLevelResponseDto): boolean =>
        level.examinationBoardId === examinationBoardId &&
        level.name.trim().toLowerCase() === normalized,
    );
  });

  protected readonly isValid: Signal<boolean> = computed(() => {
    const { name, examinationBoardId }: CreateEducationalLevelForm =
      this.form();
    return Boolean(name.trim()) && Boolean(examinationBoardId);
  });

  public ngOnInit(): void {
    const boardId: string = this.initialExaminationBoardId();
    if (
      boardId &&
      this.examinationBoards().some(
        (board: ExaminationBoardResponseDto): boolean => board._id === boardId,
      )
    ) {
      this.updateForm('examinationBoardId', boardId);
    }
  }

  protected updateForm<K extends keyof CreateEducationalLevelForm>(
    field: K,
    value: CreateEducationalLevelForm[K],
  ): void {
    this.form.update(
      (current: CreateEducationalLevelForm): CreateEducationalLevelForm => ({
        ...current,
        [field]: value,
      }),
    );
  }

  protected onSubmit(): void {
    if (!this.isValid() || this.creating()) {
      return;
    }
    const {
      examinationBoardId,
      name,
      description,
    }: CreateEducationalLevelForm = this.form();
    this.create.emit({
      examinationBoardId,
      name: name.trim(),
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
