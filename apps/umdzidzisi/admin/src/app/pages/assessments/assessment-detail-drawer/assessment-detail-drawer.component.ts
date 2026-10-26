import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  InputSignal,
  Signal,
  signal,
  untracked,
  WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  ArticleResponseDto,
  ArticlesStore,
  AssessmentResponseDto,
  AssessmentsService,
  AssessmentsStore,
  AssessmentStatus,
  CreateAssessmentQuestionDto,
  EducationalLevelsStore,
  ExaminationPaperResponseDto,
  ExaminationPapersStore,
  QuestionResponseDto,
  QuestionsStore,
  SubjectsStore,
  SubTopicsStore,
  TopicsStore,
  PaginateResult,
  UpdateAssessmentDto,
} from '@mushaviri/api';
import {
  NotificationService,
  StatusPillComponent,
  StatusTone,
} from '@mushaviri/ui';
import { AssessmentFieldsComponent } from '../assessment-fields/assessment-fields.component';
import { AssessmentQuestionBuilderComponent } from '../assessment-question-builder/assessment-question-builder.component';
import { AssessmentForm } from '../../../shared/types/assessments/assessment-form.type';
import { AssessmentLookups } from '../../../shared/types/assessments/assessment-lookups.type';
import { AssessmentSelectOptions } from '../../../shared/types/assessments/assessment-select-options.type';
import { QuestionLabel } from '../../../shared/types/assessments/question-label.type';
import { applyAssessmentFormPatch } from '../../../shared/types/assessments/apply-assessment-form-patch.const';
import { assessmentFormToDto } from '../../../shared/types/assessments/assessment-form-to-dto.const';
import { buildAssessmentSelectOptions } from '../../../shared/types/assessments/build-assessment-select-options.const';
import { isAssessmentFormValid } from '../../../shared/types/assessments/is-assessment-form-valid.const';
import { isAssessmentQuestionValid } from '../../../shared/types/assessments/is-assessment-question-valid.const';
import { resolvePaperLevelName } from '../../../shared/types/assessments/resolve-paper-level-name.const';
import { QUESTION_TYPE_LABELS } from '../../../shared/types/assessments/question-type-labels.const';
import { ASSESSMENT_STATUS_TONES } from '../../../shared/types/common/assessment-status-tones.const';

@Component({
  selector: 'org-assessment-detail-drawer',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
    StatusPillComponent,
    AssessmentFieldsComponent,
    AssessmentQuestionBuilderComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './assessment-detail-drawer.component.html',
})
export class AssessmentDetailDrawerComponent {
  private readonly router: Router = inject(Router);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly store: InstanceType<typeof AssessmentsStore> =
    inject(AssessmentsStore);
  private readonly papersStore: InstanceType<typeof ExaminationPapersStore> =
    inject(ExaminationPapersStore);
  private readonly subjectsStore: InstanceType<typeof SubjectsStore> =
    inject(SubjectsStore);
  private readonly levelsStore: InstanceType<typeof EducationalLevelsStore> =
    inject(EducationalLevelsStore);
  private readonly topicsStore: InstanceType<typeof TopicsStore> =
    inject(TopicsStore);
  private readonly subTopicsStore: InstanceType<typeof SubTopicsStore> =
    inject(SubTopicsStore);
  private readonly questionsStore: InstanceType<typeof QuestionsStore> =
    inject(QuestionsStore);
  private readonly articlesStore: InstanceType<typeof ArticlesStore> =
    inject(ArticlesStore);
  private readonly assessmentsService: AssessmentsService =
    inject(AssessmentsService);
  private readonly notificationService: NotificationService =
    inject(NotificationService);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  protected readonly saving: WritableSignal<boolean> = signal(false);
  private readonly editedForm: WritableSignal<AssessmentForm | null> =
    signal(null);
  private readonly editedQuestions: WritableSignal<
    CreateAssessmentQuestionDto[] | null
  > = signal(null);
  /** Questions picked in this session, so their labels show immediately. */
  private readonly pickedQuestions: WritableSignal<
    Map<string, QuestionResponseDto>
  > = signal(new Map());
  /** Question ids already fetched by id, so the effect never refetches. */
  private readonly requestedQuestionIds: Set<string> = new Set();
  private requestedAssessmentId: string | null = null;
  /**
   * The store only holds the assessment pages fetched so far, so a deep link
   * to an older assessment is looked up by id and kept here.
   */
  private readonly fetchedAssessment: WritableSignal<
    AssessmentResponseDto | undefined
  > = signal(undefined);
  protected readonly lookingUp: WritableSignal<boolean> = signal(false);

  public readonly assessmentId: InputSignal<string> = input.required<string>();

  protected readonly assessmentsLoading: Signal<boolean> =
    this.store.assessmentsLoading;

  protected readonly assessment: Signal<AssessmentResponseDto | undefined> =
    computed(
      () =>
        this.store
          .assessments()
          .find(
            (assessment: AssessmentResponseDto) =>
              assessment._id === this.assessmentId(),
          ) ??
        (this.fetchedAssessment()?._id === this.assessmentId()
          ? this.fetchedAssessment()
          : undefined),
    );

  private readonly lookups: Signal<AssessmentLookups> =
    computed<AssessmentLookups>(() => ({
      papers: this.papersStore.examinationPapers(),
      subjects: this.subjectsStore.subjects(),
      levels: this.levelsStore.educationalLevels(),
      topics: this.topicsStore.topics(),
      subTopics: this.subTopicsStore.subTopics(),
    }));

  protected readonly formValue: Signal<AssessmentForm> =
    computed<AssessmentForm>(() => {
      const edited: AssessmentForm | null = this.editedForm();
      if (edited) {
        return edited;
      }
      const assessment: AssessmentResponseDto | undefined = this.assessment();
      return {
        examinationPaperId: assessment?.examinationPaperId ?? '',
        educationalLevel: assessment?.educationalLevel ?? '',
        title: assessment?.title ?? '',
        description: assessment?.description ?? '',
        topicId: assessment?.topicId ?? '',
        subTopicId: assessment?.subTopicId ?? '',
        topicTags: assessment?.topicTags ?? [],
        status: assessment?.status ?? AssessmentStatus.DRAFT,
      };
    });

  protected readonly questionsValue: Signal<CreateAssessmentQuestionDto[]> =
    computed<CreateAssessmentQuestionDto[]>(
      () =>
        this.editedQuestions() ??
        [...(this.assessment()?.questions ?? [])].sort(
          (a: CreateAssessmentQuestionDto, b: CreateAssessmentQuestionDto) =>
            a.order - b.order,
        ),
    );

  protected readonly options: Signal<AssessmentSelectOptions> =
    computed<AssessmentSelectOptions>(() =>
      buildAssessmentSelectOptions(this.lookups(), this.formValue()),
    );

  protected readonly paper: Signal<ExaminationPaperResponseDto | undefined> =
    computed(() =>
      this.lookups().papers.find(
        (paper: ExaminationPaperResponseDto) =>
          paper._id === this.formValue().examinationPaperId,
      ),
    );

  protected readonly statusTone: Signal<StatusTone> = computed<StatusTone>(
    () =>
      ASSESSMENT_STATUS_TONES[
        this.assessment()?.status ?? AssessmentStatus.DRAFT
      ] ?? 'info',
  );

  private readonly knownQuestions: Signal<Map<string, QuestionResponseDto>> =
    computed<Map<string, QuestionResponseDto>>(() => {
      const known: Map<string, QuestionResponseDto> = new Map(
        this.questionsStore
          .questions()
          .map(
            (question: QuestionResponseDto): [string, QuestionResponseDto] => [
              question.id,
              question,
            ],
          ),
      );
      this.pickedQuestions().forEach(
        (question: QuestionResponseDto, id: string): void => {
          known.set(id, question);
        },
      );
      return known;
    });

  private readonly articleTitles: Signal<Map<string, string>> = computed<
    Map<string, string>
  >(
    () =>
      new Map(
        this.articlesStore
          .articles()
          .map((article: ArticleResponseDto): [string, string] => [
            article.id,
            article.title,
          ]),
      ),
  );

  /** Builder row labels: linked article title + question type, else the id. */
  protected readonly questionLabels: Signal<Map<string, QuestionLabel>> =
    computed<Map<string, QuestionLabel>>(() => {
      const known: Map<string, QuestionResponseDto> = this.knownQuestions();
      const titles: Map<string, string> = this.articleTitles();
      return new Map(
        this.questionsValue().map(
          ({
            questionId,
          }: CreateAssessmentQuestionDto): [string, QuestionLabel] => {
            const question: QuestionResponseDto | undefined =
              known.get(questionId);
            const title: string | undefined = question
              ? titles.get(question.articleId)
              : undefined;
            return [
              questionId,
              {
                title: title ?? questionId,
                type: question
                  ? (QUESTION_TYPE_LABELS[question.questionType] ??
                    question.questionType)
                  : null,
                resolved: Boolean(title),
              },
            ];
          },
        ),
      );
    });

  protected readonly isValid: Signal<boolean> = computed<boolean>(
    () =>
      isAssessmentFormValid(this.formValue()) &&
      this.questionsValue().every(isAssessmentQuestionValid),
  );

  protected readonly isDirty: Signal<boolean> = computed<boolean>(
    () => this.editedForm() !== null || this.editedQuestions() !== null,
  );

  public constructor() {
    this.store.loadAssessments();
    this.papersStore.loadExaminationPapers();
    this.subjectsStore.loadSubjects();
    this.levelsStore.loadEducationalLevels();
    this.topicsStore.loadTopics();
    this.subTopicsStore.loadSubTopics();
    this.articlesStore.loadArticles();

    effect((): void => {
      const id: string = this.assessmentId();
      if (
        this.store.assessmentsLoaded() &&
        !this.assessment() &&
        this.requestedAssessmentId !== id
      ) {
        this.requestedAssessmentId = id;
        untracked((): void => this.lookUpAssessment(id));
      }
    });

    // Resolve questions referenced by the assessment but not loaded yet.
    effect((): void => {
      const known: Map<string, QuestionResponseDto> = this.knownQuestions();
      const missing: string[] = this.questionsValue()
        .map((question: CreateAssessmentQuestionDto) => question.questionId)
        .filter(
          (id: string) => !known.has(id) && !this.requestedQuestionIds.has(id),
        );
      if (missing.length === 0) {
        return;
      }
      missing.forEach((id: string) => this.requestedQuestionIds.add(id));
      untracked((): void =>
        this.questionsStore.loadQuestions({
          ids: missing,
          limit: missing.length,
        }),
      );
    });
  }

  protected updateForm(patch: Partial<AssessmentForm>): void {
    this.editedForm.set(
      applyAssessmentFormPatch(
        this.formValue(),
        patch,
        (paperId: string): string =>
          resolvePaperLevelName(this.lookups(), paperId),
      ),
    );
  }

  protected updateQuestions(questions: CreateAssessmentQuestionDto[]): void {
    this.editedQuestions.set(questions);
  }

  protected cacheQuestion(question: QuestionResponseDto): void {
    this.pickedQuestions.update(
      (
        current: Map<string, QuestionResponseDto>,
      ): Map<string, QuestionResponseDto> =>
        new Map(current).set(question.id, question),
    );
  }

  protected saveAssessment(): void {
    if (!this.isValid() || this.saving()) {
      return;
    }
    this.saving.set(true);
    const dto: UpdateAssessmentDto = {
      ...assessmentFormToDto(this.formValue()),
      // PATCH replaces the whole array, so always send every question.
      questions: this.questionsValue().map(
        (
          question: CreateAssessmentQuestionDto,
          index: number,
        ): CreateAssessmentQuestionDto => ({
          questionId: question.questionId,
          marks: Number(question.marks),
          timeAllowed: Number(question.timeAllowed),
          order: index + 1,
          ...(question.sectionLabel?.trim()
            ? { sectionLabel: question.sectionLabel.trim() }
            : {}),
          ...(question.questionNumber?.trim()
            ? { questionNumber: question.questionNumber.trim() }
            : {}),
        }),
      ),
    };
    this.store.updateAssessment(this.assessmentId(), dto, {
      next: (updated: AssessmentResponseDto): void => {
        this.saving.set(false);
        if (this.fetchedAssessment()?._id === updated._id) {
          this.fetchedAssessment.set(updated);
        }
        this.editedForm.set(null);
        this.editedQuestions.set(null);
        this.notificationService.show({
          message: 'Assessment saved.',
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

  private lookUpAssessment(id: string): void {
    this.lookingUp.set(true);
    this.assessmentsService
      .list({ id, limit: 1 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result: PaginateResult<AssessmentResponseDto>): void => {
          this.fetchedAssessment.set(
            result.docs.find(
              (assessment: AssessmentResponseDto) => assessment._id === id,
            ),
          );
          this.lookingUp.set(false);
        },
        error: (): void => {
          this.lookingUp.set(false);
        },
      });
  }
}
