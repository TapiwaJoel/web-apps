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
  CreateGradeDto,
  ExaminationBoardResponseDto,
  GradeResponseDto,
} from '@mushaviri/api';
import { CreateGradeForm } from '../../../shared/types/grades/create-grade-form.type';
import { EMPTY_CREATE_GRADE_FORM } from '../../../shared/types/grades/empty-create-grade-form.const';
import { IS_VALID_DISPLAY_ORDER } from '../../../shared/types/grades/is-valid-display-order.const';
import { LevelOption } from '../../../shared/types/grades/level-option.type';

@Component({
  selector: 'org-create-grade-dialog',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './create-grade-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateGradeDialogComponent implements OnInit {
  public readonly creating: InputSignal<boolean> = input(false);
  public readonly examinationBoards: InputSignal<
    ExaminationBoardResponseDto[]
  > = input<ExaminationBoardResponseDto[]>([]);
  /** Levels labelled "Level · Board". */
  public readonly levelOptions: InputSignal<LevelOption[]> = input<
    LevelOption[]
  >([]);
  /** Existing grades, used to flag a taken name or displayOrder in the level. */
  public readonly grades: InputSignal<GradeResponseDto[]> = input<
    GradeResponseDto[]
  >([]);
  /** Pre-selects a level, e.g. when the list is filtered to one. */
  public readonly initialEducationalLevelId: InputSignal<string> =
    input<string>('');

  public readonly create: OutputEmitterRef<CreateGradeDto> =
    output<CreateGradeDto>();
  public readonly closed: OutputEmitterRef<void> = output<void>();

  protected readonly form: WritableSignal<CreateGradeForm> = signal({
    ...EMPTY_CREATE_GRADE_FORM,
  });

  /** Until the user types a display order, it follows the chosen level. */
  private readonly displayOrderTouched: WritableSignal<boolean> = signal(false);

  protected readonly availableLevels: Signal<LevelOption[]> = computed(() => {
    const boardId: string = this.form().examinationBoardId;
    return boardId
      ? this.levelOptions().filter(
          (option: LevelOption): boolean =>
            option.examinationBoardId === boardId,
        )
      : this.levelOptions();
  });

  private readonly gradesInLevel: Signal<GradeResponseDto[]> = computed(() => {
    const levelId: string = this.form().educationalLevelId;
    return levelId
      ? this.grades().filter(
          (grade: GradeResponseDto): boolean =>
            grade.educationalLevelId === levelId,
        )
      : [];
  });

  protected readonly displayOrderValid: Signal<boolean> = computed(() =>
    IS_VALID_DISPLAY_ORDER(this.form().displayOrder),
  );

  protected readonly displayOrderTakenBy: Signal<string | null> = computed(
    () => {
      const displayOrder: number | null = this.form().displayOrder;
      return (
        this.gradesInLevel().find(
          (grade: GradeResponseDto): boolean =>
            grade.displayOrder === displayOrder,
        )?.name ?? null
      );
    },
  );

  protected readonly isDuplicateName: Signal<boolean> = computed(() => {
    const normalized: string = this.form().name.trim().toLowerCase();
    return (
      Boolean(normalized) &&
      this.gradesInLevel().some(
        (grade: GradeResponseDto): boolean =>
          grade.name.trim().toLowerCase() === normalized,
      )
    );
  });

  protected readonly isValid: Signal<boolean> = computed(() => {
    const { educationalLevelId, name }: CreateGradeForm = this.form();
    return (
      Boolean(educationalLevelId) &&
      Boolean(name.trim()) &&
      this.displayOrderValid()
    );
  });

  public ngOnInit(): void {
    const level: LevelOption | undefined = this.levelOptions().find(
      (option: LevelOption): boolean =>
        option.id === this.initialEducationalLevelId(),
    );
    if (level) {
      this.updateForm('examinationBoardId', level.examinationBoardId);
      this.updateForm('educationalLevelId', level.id);
    }
  }

  protected updateForm<K extends keyof CreateGradeForm>(
    field: K,
    value: CreateGradeForm[K],
  ): void {
    if (field === 'displayOrder') {
      this.displayOrderTouched.set(true);
    }
    this.form.update((current: CreateGradeForm): CreateGradeForm => {
      const next: CreateGradeForm = { ...current, [field]: value };
      if (field === 'examinationBoardId') {
        const levelStillValid: boolean = this.levelOptions().some(
          (option: LevelOption): boolean =>
            option.id === next.educationalLevelId &&
            option.examinationBoardId === value,
        );
        if (!levelStillValid) {
          next.educationalLevelId = '';
        }
      }
      if (field === 'educationalLevelId' && !this.displayOrderTouched()) {
        next.displayOrder = this.nextDisplayOrder(value as string);
      }
      return next;
    });
  }

  protected onSubmit(): void {
    if (!this.isValid() || this.creating()) {
      return;
    }
    const { educationalLevelId, name, displayOrder }: CreateGradeForm =
      this.form();
    this.create.emit({
      educationalLevelId,
      name: name.trim(),
      displayOrder: Number(displayOrder),
    });
  }

  protected onCancel(): void {
    if (this.creating()) {
      return;
    }
    this.closed.emit();
  }

  private nextDisplayOrder(levelId: string): number | null {
    if (!levelId) {
      return null;
    }
    const orders: number[] = this.grades()
      .filter(
        (grade: GradeResponseDto): boolean =>
          grade.educationalLevelId === levelId,
      )
      .map((grade: GradeResponseDto): number => grade.displayOrder);
    return orders.length ? Math.max(...orders) + 1 : 1;
  }
}
