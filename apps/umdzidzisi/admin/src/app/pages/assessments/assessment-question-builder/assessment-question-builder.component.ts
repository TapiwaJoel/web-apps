import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  Signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  CreateAssessmentQuestionDto,
  QuestionResponseDto,
} from '@mushaviri/api';
import { QuestionPickerComponent } from '../../../shared/components/question-picker/question-picker.component';
import { QuestionLabel } from '../../../shared/types/assessments/question-label.type';
import { QuestionBuilderSummary } from '../../../shared/types/assessments/question-builder-summary.type';
import { ASSESSMENT_LIMITS } from '../../../shared/types/assessments/assessment-limits.const';
import { isAssessmentQuestionValid } from '../../../shared/types/assessments/is-assessment-question-valid.const';

/**
 * Presentational editor for an assessment's `questions[]`. Every edit emits
 * the whole renumbered array (PATCH replaces it server-side); the parent owns
 * the state and the question-label cache.
 */
@Component({
  selector: 'org-assessment-question-builder',
  standalone: true,
  imports: [FormsModule, QuestionPickerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './assessment-question-builder.component.html',
  styleUrl: './assessment-question-builder.component.scss',
})
export class AssessmentQuestionBuilderComponent {
  protected readonly limits: typeof ASSESSMENT_LIMITS = ASSESSMENT_LIMITS;

  public readonly questions: InputSignal<CreateAssessmentQuestionDto[]> = input<
    CreateAssessmentQuestionDto[]
  >([]);
  public readonly labels: InputSignal<Map<string, QuestionLabel>> = input<
    Map<string, QuestionLabel>
  >(new Map());
  public readonly paperMarks: InputSignal<number | null> = input<number | null>(
    null,
  );
  public readonly paperQuestionCount: InputSignal<number | null> = input<
    number | null
  >(null);

  public readonly questionsChange: OutputEmitterRef<
    CreateAssessmentQuestionDto[]
  > = output<CreateAssessmentQuestionDto[]>();
  /** Fired with the full question so the parent can cache its label. */
  public readonly questionPicked: OutputEmitterRef<QuestionResponseDto> =
    output<QuestionResponseDto>();

  protected readonly excludeIds: Signal<string[]> = computed<string[]>(() =>
    this.questions().map(
      (question: CreateAssessmentQuestionDto) => question.questionId,
    ),
  );

  protected readonly summary: Signal<QuestionBuilderSummary> =
    computed<QuestionBuilderSummary>(() => {
      const questions: CreateAssessmentQuestionDto[] = this.questions();
      const sum: (
        pick: (q: CreateAssessmentQuestionDto) => number,
      ) => number = (
        pick: (q: CreateAssessmentQuestionDto) => number,
      ): number =>
        questions.reduce(
          (total: number, question: CreateAssessmentQuestionDto) =>
            total + (Number.isFinite(pick(question)) ? pick(question) : 0),
          0,
        );
      const totalMarks: number = sum(
        (q: CreateAssessmentQuestionDto) => q.marks,
      );
      const targetMarks: number | null = this.paperMarks();
      const targetCount: number | null = this.paperQuestionCount();
      return {
        count: questions.length,
        totalMarks,
        totalMinutes: sum((q: CreateAssessmentQuestionDto) => q.timeAllowed),
        targetMarks,
        targetCount,
        marksMismatch: targetMarks !== null && totalMarks !== targetMarks,
        countMismatch: targetCount !== null && questions.length !== targetCount,
        marksPercent:
          targetMarks && targetMarks > 0
            ? Math.min(100, Math.round((totalMarks / targetMarks) * 100))
            : 0,
      };
    });

  protected labelFor(questionId: string): QuestionLabel {
    return (
      this.labels().get(questionId) ?? {
        title: questionId,
        type: null,
        resolved: false,
      }
    );
  }

  protected isRowValid(question: CreateAssessmentQuestionDto): boolean {
    return isAssessmentQuestionValid(question);
  }

  protected onQuestionPicked(question: QuestionResponseDto): void {
    if (this.excludeIds().includes(question.id)) {
      return;
    }
    this.questionPicked.emit(question);
    this.emit([
      ...this.questions(),
      {
        questionId: question.id,
        marks: 1,
        timeAllowed: 1,
        order: this.questions().length + 1,
      },
    ]);
  }

  protected updateRow<K extends keyof CreateAssessmentQuestionDto>(
    index: number,
    field: K,
    value: CreateAssessmentQuestionDto[K],
  ): void {
    this.emit(
      this.questions().map(
        (
          question: CreateAssessmentQuestionDto,
          i: number,
        ): CreateAssessmentQuestionDto =>
          i === index ? { ...question, [field]: value } : question,
      ),
    );
  }

  protected move(index: number, delta: -1 | 1): void {
    const target: number = index + delta;
    const next: CreateAssessmentQuestionDto[] = [...this.questions()];
    if (target < 0 || target >= next.length) {
      return;
    }
    [next[index], next[target]] = [next[target], next[index]];
    this.emit(next);
  }

  protected remove(index: number): void {
    this.emit(
      this.questions().filter(
        (_question: CreateAssessmentQuestionDto, i: number) => i !== index,
      ),
    );
  }

  /** Emits the array with `order` renumbered 1..n to match its position. */
  private emit(questions: CreateAssessmentQuestionDto[]): void {
    this.questionsChange.emit(
      questions.map(
        (
          question: CreateAssessmentQuestionDto,
          i: number,
        ): CreateAssessmentQuestionDto => ({ ...question, order: i + 1 }),
      ),
    );
  }
}
