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
  CreateTopicDto,
  GradeResponseDto,
  SubjectResponseDto,
  TopicResponseDto,
} from '@mushaviri/api';
import { CreateTopicForm } from '../../../shared/types/topics/create-topic-form.type';
import { EMPTY_CREATE_TOPIC_FORM } from '../../../shared/types/topics/empty-create-topic-form.const';
import { isPositiveInteger } from '../../../shared/types/topics/is-positive-integer.const';

@Component({
  selector: 'org-create-topic-dialog',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './create-topic-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateTopicDialogComponent implements OnInit {
  // State
  protected readonly form: WritableSignal<CreateTopicForm> = signal({
    ...EMPTY_CREATE_TOPIC_FORM,
  });

  // Signal inputs
  public readonly subjects: InputSignal<SubjectResponseDto[]> = input<
    SubjectResponseDto[]
  >([]);
  public readonly grades: InputSignal<GradeResponseDto[]> = input<
    GradeResponseDto[]
  >([]);
  /** Existing topics, used for the duplicate-order warning. */
  public readonly topics: InputSignal<TopicResponseDto[]> = input<
    TopicResponseDto[]
  >([]);
  public readonly initialSubjectId: InputSignal<string> = input<string>('');
  public readonly initialGradeId: InputSignal<string> = input<string>('');
  public readonly creating: InputSignal<boolean> = input(false);

  // Signal outputs
  public readonly create: OutputEmitterRef<CreateTopicDto> =
    output<CreateTopicDto>();
  public readonly closed: OutputEmitterRef<void> = output<void>();

  // Computed signals
  /** Only grades at the chosen subject's educational level. */
  protected readonly availableGrades: Signal<GradeResponseDto[]> = computed<
    GradeResponseDto[]
  >(() => this.gradesForSubject(this.form().subjectId));

  protected readonly orderTaken: Signal<boolean> = computed<boolean>(() => {
    const { subjectId, gradeId, order }: CreateTopicForm = this.form();
    return this.topics().some(
      (topic: TopicResponseDto): boolean =>
        topic.subjectId === subjectId &&
        topic.gradeId === gradeId &&
        topic.order === order,
    );
  });

  protected readonly isValid: Signal<boolean> = computed<boolean>(() => {
    const form: CreateTopicForm = this.form();
    return (
      Boolean(form.subjectId) &&
      Boolean(form.gradeId) &&
      Boolean(form.name.trim()) &&
      isPositiveInteger(form.order)
    );
  });

  // Lifecycle hooks
  public ngOnInit(): void {
    const subjectId: string = this.subjects().some(
      (subject: SubjectResponseDto): boolean =>
        subject._id === this.initialSubjectId(),
    )
      ? this.initialSubjectId()
      : '';
    const gradeId: string = this.gradesForSubject(subjectId).some(
      (grade: GradeResponseDto): boolean => grade._id === this.initialGradeId(),
    )
      ? this.initialGradeId()
      : '';
    this.form.set({
      ...EMPTY_CREATE_TOPIC_FORM,
      subjectId,
      gradeId,
      order: this.nextOrder(subjectId, gradeId),
    });
  }

  // Public methods
  protected updateForm<K extends keyof CreateTopicForm>(
    field: K,
    value: CreateTopicForm[K],
  ): void {
    this.form.update((current: CreateTopicForm): CreateTopicForm => {
      const next: CreateTopicForm = {
        ...current,
        [field]: value,
        ...(field === 'subjectId' ? { gradeId: '' } : {}),
      };
      // Suggest the next free slot once the ordering scope is known.
      if (field === 'gradeId' && next.subjectId && next.gradeId) {
        next.order = this.nextOrder(next.subjectId, next.gradeId);
      }
      return next;
    });
  }

  protected onSubmit(): void {
    if (!this.isValid() || this.creating()) {
      return;
    }
    const form: CreateTopicForm = this.form();
    this.create.emit({
      subjectId: form.subjectId,
      gradeId: form.gradeId,
      name: form.name.trim(),
      order: form.order as number,
      status: ContentStatus.DRAFT,
    });
  }

  protected onCancel(): void {
    if (this.creating()) {
      return;
    }
    this.closed.emit();
  }

  // Private methods
  private gradesForSubject(subjectId: string): GradeResponseDto[] {
    const levelId: string | undefined = this.subjects().find(
      (subject: SubjectResponseDto): boolean => subject._id === subjectId,
    )?.educationalLevelId;
    if (!levelId) {
      return [];
    }
    return this.grades()
      .filter(
        (grade: GradeResponseDto): boolean =>
          grade.educationalLevelId === levelId,
      )
      .sort(
        (a: GradeResponseDto, b: GradeResponseDto): number =>
          a.displayOrder - b.displayOrder,
      );
  }

  private nextOrder(subjectId: string, gradeId: string): number {
    const orders: number[] = this.topics()
      .filter(
        (topic: TopicResponseDto): boolean =>
          topic.subjectId === subjectId && topic.gradeId === gradeId,
      )
      .map((topic: TopicResponseDto): number => topic.order);
    return orders.length === 0 ? 1 : Math.max(...orders) + 1;
  }
}
