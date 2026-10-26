import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import {
  ArticleResponseDto,
  ArticlesStore,
  ListQuestionsQueryDto,
  QuestionResponseDto,
  QuestionsStore,
  QuestionStatus,
  QuestionType,
} from '@mushaviri/api';
import { StatusPillComponent, StatusTone } from '@mushaviri/ui';

const SEARCH_DEBOUNCE_MS: number = 300;
const MAX_RESULTS: number = 50;

const QUESTION_STATUS_TONES: Record<QuestionStatus, StatusTone> = {
  [QuestionStatus.PUBLISHED]: 'success',
  [QuestionStatus.DRAFT]: 'info',
  [QuestionStatus.ARCHIVED]: 'warning',
};

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  [QuestionType.MULTIPLE_CHOICE]: 'Multiple choice',
  [QuestionType.MULTIPLE_RESPONSE]: 'Multiple response',
  [QuestionType.TRUE_FALSE]: 'True / false',
  [QuestionType.MATCHING]: 'Matching',
  [QuestionType.FILL_BLANK]: 'Fill in the blank',
  [QuestionType.FREE_TEXT]: 'Free text',
};

interface PickerFilters {
  term: string;
  type: QuestionType | '';
  status: QuestionStatus | '';
}

let nextPickerId: number = 0;

/**
 * Searchable list of CMS questions with an "Add" action per row.
 *
 * Questions carry no text of their own: the question body is the linked
 * article, so the article title is shown (and searched) as the stem.
 */
@Component({
  selector: 'org-question-picker',
  standalone: true,
  imports: [FormsModule, StatusPillComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './question-picker.component.html',
})
export class QuestionPickerComponent {
  // Injected services
  private readonly questionsStore: InstanceType<typeof QuestionsStore> =
    inject(QuestionsStore);
  private readonly articlesStore: InstanceType<typeof ArticlesStore> =
    inject(ArticlesStore);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  // State
  protected readonly QUESTION_STATUS_TONES: Record<QuestionStatus, StatusTone> =
    QUESTION_STATUS_TONES;
  protected readonly QUESTION_TYPE_LABELS: Record<QuestionType, string> =
    QUESTION_TYPE_LABELS;
  protected readonly typeOptions: QuestionType[] = Object.values(QuestionType);
  protected readonly statusOptions: QuestionStatus[] =
    Object.values(QuestionStatus);
  protected readonly pickerId: string = `question-picker-${nextPickerId++}`;
  protected readonly searchTerm: WritableSignal<string> = signal('');
  protected readonly typeFilter: WritableSignal<QuestionType | ''> = signal('');
  protected readonly statusFilter: WritableSignal<QuestionStatus | ''> =
    signal('');

  // Inputs
  public readonly excludeIds: InputSignal<string[]> = input<string[]>([]);

  // Outputs
  public readonly questionPicked: OutputEmitterRef<QuestionResponseDto> =
    output<QuestionResponseDto>();

  // Computed
  protected readonly questionsLoading: Signal<boolean> =
    this.questionsStore.questionsLoading;
  protected readonly questionsError: Signal<string | null> =
    this.questionsStore.questionsError;

  private readonly filters: Signal<PickerFilters> = computed(
    (): PickerFilters => ({
      term: this.searchTerm().trim(),
      type: this.typeFilter(),
      status: this.statusFilter(),
    }),
  );

  protected readonly excludedSet: Signal<Set<string>> = computed(
    (): Set<string> => new Set<string>(this.excludeIds()),
  );

  protected readonly articleTitles: Signal<Map<string, string>> = computed(
    (): Map<string, string> =>
      new Map<string, string>(
        this.articlesStore
          .articles()
          .map((article: ArticleResponseDto): [string, string] => [
            article.id,
            article.title,
          ]),
      ),
  );

  protected readonly results: Signal<QuestionResponseDto[]> = computed(
    (): QuestionResponseDto[] => {
      const term: string = this.searchTerm().trim().toLowerCase();
      const type: QuestionType | '' = this.typeFilter();
      const status: QuestionStatus | '' = this.statusFilter();
      const titles: Map<string, string> = this.articleTitles();
      return this.questionsStore
        .questions()
        .filter((question: QuestionResponseDto) => {
          if (type && question.questionType !== type) {
            return false;
          }
          if (status && question.status !== status) {
            return false;
          }
          if (!term) {
            return true;
          }
          const haystack: string = [
            titles.get(question.articleId) ?? '',
            QUESTION_TYPE_LABELS[question.questionType],
            question.hint ?? '',
            ...question.tags,
          ]
            .join(' ')
            .toLowerCase();
          return haystack.includes(term);
        })
        .slice(0, MAX_RESULTS);
    },
  );

  protected readonly availableCount: Signal<number> = computed(
    (): number =>
      this.results().filter(
        (question: QuestionResponseDto) => !this.excludedSet().has(question.id),
      ).length,
  );

  public constructor() {
    this.questionsStore.loadQuestions();
    this.articlesStore.loadArticles();

    // The backend has no free-text search; a search term is sent as a tag
    // filter (alongside type/status) to pull in matches beyond the first load.
    toObservable(this.filters)
      .pipe(
        debounceTime(SEARCH_DEBOUNCE_MS),
        distinctUntilChanged(
          (a: PickerFilters, b: PickerFilters): boolean =>
            a.term === b.term && a.type === b.type && a.status === b.status,
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((filters: PickerFilters): void => {
        const query: ListQuestionsQueryDto = {};
        if (filters.term) {
          query.tags = [filters.term];
        }
        if (filters.type) {
          query.questionType = filters.type;
        }
        if (filters.status) {
          query.status = filters.status;
        }
        if (Object.keys(query).length > 0) {
          this.questionsStore.loadQuestions(query);
        }
      });
  }

  // Public methods
  public stem(question: QuestionResponseDto): string {
    return this.articleTitles().get(question.articleId) ?? 'Untitled question';
  }

  public pick(question: QuestionResponseDto): void {
    if (this.excludedSet().has(question.id)) {
      return;
    }
    this.questionPicked.emit(question);
  }

  public clearFilters(): void {
    this.searchTerm.set('');
    this.typeFilter.set('');
    this.statusFilter.set('');
  }
}
