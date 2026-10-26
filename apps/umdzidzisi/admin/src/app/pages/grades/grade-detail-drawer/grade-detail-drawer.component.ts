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
  EducationalLevelResponseDto,
  EducationalLevelsStore,
  EntityStatus,
  ExaminationBoardResponseDto,
  ExaminationBoardsStore,
  GradeResponseDto,
  GradesStore,
  UpdateGradeDto,
} from '@mushaviri/api';
import {
  NotificationService,
  StatusPillComponent,
  StatusTone,
} from '@mushaviri/ui';
import { ENTITY_STATUS_OPTIONS } from '../../../shared/types/common/entity-status-options.const';
import { ENTITY_STATUS_TONES } from '../../../shared/types/common/entity-status-tones.const';
import { SelectOption } from '../../../shared/types/common/select-option.type';
import { GradeForm } from '../../../shared/types/grades/grade-form.type';
import { IS_VALID_DISPLAY_ORDER } from '../../../shared/types/grades/is-valid-display-order.const';
import { LevelOption } from '../../../shared/types/grades/level-option.type';

@Component({
  selector: 'org-grade-detail-drawer',
  standalone: true,
  imports: [DatePipe, FormsModule, StatusPillComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './grade-detail-drawer.component.html',
})
export class GradeDetailDrawerComponent {
  protected readonly statusOptions: SelectOption<EntityStatus>[] =
    ENTITY_STATUS_OPTIONS;

  private readonly router: Router = inject(Router);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly store: InstanceType<typeof GradesStore> =
    inject(GradesStore);
  private readonly educationalLevelsStore: InstanceType<
    typeof EducationalLevelsStore
  > = inject(EducationalLevelsStore);
  private readonly examinationBoardsStore: InstanceType<
    typeof ExaminationBoardsStore
  > = inject(ExaminationBoardsStore);
  private readonly notificationService: NotificationService =
    inject(NotificationService);

  public readonly gradeId: InputSignal<string> = input.required<string>();

  protected readonly gradesLoading: Signal<boolean> = this.store.gradesLoading;

  protected readonly grade: Signal<GradeResponseDto | undefined> = computed(
    () =>
      this.store
        .grades()
        .find(
          (grade: GradeResponseDto): boolean => grade._id === this.gradeId(),
        ),
  );

  private readonly examinationBoardNamesById: Signal<Map<string, string>> =
    computed<Map<string, string>>(
      () =>
        new Map(
          this.examinationBoardsStore
            .examinationBoards()
            .map((board: ExaminationBoardResponseDto): [string, string] => [
              board._id,
              board.name,
            ]),
        ),
    );

  protected readonly levelOptions: Signal<LevelOption[]> = computed<
    LevelOption[]
  >(() =>
    this.educationalLevelsStore
      .educationalLevels()
      .map((level: EducationalLevelResponseDto): LevelOption => ({
        id: level._id,
        examinationBoardId: level.examinationBoardId,
        label: `${level.name} · ${
          this.examinationBoardNamesById().get(level.examinationBoardId) ??
          level.examinationBoardId
        }`,
      }))
      .sort((a: LevelOption, b: LevelOption): number =>
        a.label.localeCompare(b.label),
      ),
  );

  protected readonly levelLabel: Signal<string> = computed(() => {
    const levelId: string = this.grade()?.educationalLevelId ?? '';
    return (
      this.levelOptions().find(
        (option: LevelOption): boolean => option.id === levelId,
      )?.label ?? levelId
    );
  });

  protected readonly statusTone: Signal<StatusTone> = computed(
    () =>
      ENTITY_STATUS_TONES[this.grade()?.status ?? EntityStatus.ACTIVE] ??
      'info',
  );

  protected readonly saving: WritableSignal<boolean> = signal(false);

  private readonly editedForm: WritableSignal<GradeForm | null> = signal(null);

  protected readonly formValue: Signal<GradeForm> = computed(() => {
    const edited: GradeForm | null = this.editedForm();
    if (edited) {
      return edited;
    }
    const grade: GradeResponseDto | undefined = this.grade();
    return {
      educationalLevelId: grade?.educationalLevelId ?? '',
      name: grade?.name ?? '',
      displayOrder: grade?.displayOrder ?? null,
      status: grade?.status ?? EntityStatus.ACTIVE,
    };
  });

  /** Other grades in the level currently selected in the form. */
  private readonly siblingGrades: Signal<GradeResponseDto[]> = computed(() => {
    const levelId: string = this.formValue().educationalLevelId;
    return this.store
      .grades()
      .filter(
        (grade: GradeResponseDto): boolean =>
          grade._id !== this.gradeId() && grade.educationalLevelId === levelId,
      );
  });

  protected readonly displayOrderValid: Signal<boolean> = computed(() =>
    IS_VALID_DISPLAY_ORDER(this.formValue().displayOrder),
  );

  protected readonly displayOrderTakenBy: Signal<string | null> = computed(
    () => {
      const displayOrder: number | null = this.formValue().displayOrder;
      return (
        this.siblingGrades().find(
          (grade: GradeResponseDto): boolean =>
            grade.displayOrder === displayOrder,
        )?.name ?? null
      );
    },
  );

  protected readonly isDuplicateName: Signal<boolean> = computed(() => {
    const normalized: string = this.formValue().name.trim().toLowerCase();
    return (
      Boolean(normalized) &&
      this.siblingGrades().some(
        (grade: GradeResponseDto): boolean =>
          grade.name.trim().toLowerCase() === normalized,
      )
    );
  });

  protected readonly isValid: Signal<boolean> = computed(() => {
    const { educationalLevelId, name }: GradeForm = this.formValue();
    return (
      Boolean(educationalLevelId) &&
      Boolean(name.trim()) &&
      this.displayOrderValid()
    );
  });

  protected readonly isDirty: Signal<boolean> = computed(
    () => this.editedForm() !== null,
  );

  public constructor() {
    this.store.loadGrades();
    this.educationalLevelsStore.loadEducationalLevels();
    this.examinationBoardsStore.loadExaminationBoards();
  }

  protected updateForm<K extends keyof GradeForm>(
    field: K,
    value: GradeForm[K],
  ): void {
    this.editedForm.set({ ...this.formValue(), [field]: value });
  }

  protected saveGrade(): void {
    if (!this.isValid() || this.saving()) {
      return;
    }
    this.saving.set(true);
    const { educationalLevelId, name, displayOrder, status }: GradeForm =
      this.formValue();
    const dto: UpdateGradeDto = {
      educationalLevelId,
      name: name.trim(),
      displayOrder: Number(displayOrder),
      status,
    };
    this.store.updateGrade(this.gradeId(), dto, {
      next: (): void => {
        this.saving.set(false);
        this.editedForm.set(null);
        this.notificationService.show({
          message: 'Grade updated.',
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
