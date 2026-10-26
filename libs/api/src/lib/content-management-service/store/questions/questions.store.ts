import { inject, Signal, Type } from '@angular/core';
import {
  patchState,
  signalStore,
  StateSignals,
  StateSource,
  withMethods,
  withState,
  WritableStateSource,
} from '@ngrx/signals';
import {
  CreateQuestionDto,
  ListQuestionsQueryDto,
  QuestionResponseDto,
  UpdateQuestionDto,
} from '../../dtos';
import { QuestionsService } from '../../services';
import { Observable, map } from 'rxjs';
import { fetchAllOffsetPages, PaginateResult } from '../../../common';
import { QuestionsState } from './questions.state.type';

const initialState: QuestionsState = {
  questions: [],
  questionsLoaded: false,
  questionsLoading: false,
  questionsError: null,
};

/** `mapHttpError` surfaces the backend's ServiceResponse.message as `ApiError`. */
function toErrorMessage(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message;
  }
  return 'Something went wrong. Please try again.';
}

/**
 * Shared questions state for admin apps.
 *
 * Loaded once and kept in this root singleton so navigating away from and
 * back to the Questions page reads already-fetched state instead of
 * refetching.
 */
export const QuestionsStore: Type<
  {
    questions: Signal<QuestionResponseDto[]>;
    questionsLoaded: Signal<boolean>;
    questionsLoading: Signal<boolean>;
    questionsError: Signal<string | null>;
    loadQuestions: (query?: ListQuestionsQueryDto) => void;
    createQuestion: (
      dto: CreateQuestionDto,
      callbacks: {
        next: (question: QuestionResponseDto) => void;
        error: (message: string) => void;
      },
    ) => void;
    updateQuestion: (
      id: string,
      dto: UpdateQuestionDto,
      callbacks: {
        next: (question: QuestionResponseDto) => void;
        error: (message: string) => void;
      },
    ) => void;
  } & StateSource<QuestionsState>
> = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (
      store: StateSignals<QuestionsState> & WritableStateSource<QuestionsState>,
      questionsService: QuestionsService = inject(QuestionsService),
    ): {
      loadQuestions: (query?: ListQuestionsQueryDto) => void;
      createQuestion: (
        dto: CreateQuestionDto,
        callbacks: {
          next: (question: QuestionResponseDto) => void;
          error: (message: string) => void;
        },
      ) => void;
      updateQuestion: (
        id: string,
        dto: UpdateQuestionDto,
        callbacks: {
          next: (question: QuestionResponseDto) => void;
          error: (message: string) => void;
        },
      ) => void;
    } => ({
      loadQuestions(query?: ListQuestionsQueryDto): void {
        const isLoadAll: boolean = !query || Object.keys(query).length === 0;

        if (isLoadAll) {
          if (store.questionsLoaded() || store.questionsLoading()) {
            return;
          }
          patchState(store, { questionsLoading: true, questionsError: null });
        }

        const toDocs: (
          result: PaginateResult<QuestionResponseDto>,
        ) => QuestionResponseDto[] = (
          result: PaginateResult<QuestionResponseDto>,
        ): QuestionResponseDto[] => result.docs;
        const items$: Observable<QuestionResponseDto[]> = isLoadAll
          ? fetchAllOffsetPages(
              (
                limit: number,
                offset: number,
              ): Observable<QuestionResponseDto[]> =>
                questionsService.list({ limit, offset }).pipe(map(toDocs)),
            )
          : questionsService.list(query ?? {}).pipe(map(toDocs));

        items$.subscribe({
          next: (docs: QuestionResponseDto[]): void => {
            if (isLoadAll) {
              patchState(store, {
                questions: docs,
                questionsLoaded: true,
                questionsLoading: false,
              });
            } else {
              const existingIds: Set<string> = new Set(
                store.questions().map((item: QuestionResponseDto) => item.id),
              );
              const newItems: QuestionResponseDto[] = docs.filter(
                (item: QuestionResponseDto) => !existingIds.has(item.id),
              );
              patchState(store, {
                questions: [...store.questions(), ...newItems],
              });
            }
          },
          error: (error: unknown): void => {
            if (isLoadAll) {
              patchState(store, {
                questionsLoading: false,
                questionsError: toErrorMessage(error),
              });
            }
          },
        });
      },

      createQuestion(
        dto: CreateQuestionDto,
        callbacks: {
          next: (question: QuestionResponseDto) => void;
          error: (message: string) => void;
        },
      ): void {
        questionsService.create(dto).subscribe({
          next: (created: QuestionResponseDto): void => {
            patchState(store, { questions: [...store.questions(), created] });
            callbacks.next(created);
          },
          error: (error: unknown): void => {
            callbacks.error(toErrorMessage(error));
          },
        });
      },

      updateQuestion(
        id: string,
        dto: UpdateQuestionDto,
        callbacks: {
          next: (question: QuestionResponseDto) => void;
          error: (message: string) => void;
        },
      ): void {
        questionsService.update(id, dto).subscribe({
          next: (updated: QuestionResponseDto): void => {
            patchState(store, {
              questions: store
                .questions()
                .map((question: QuestionResponseDto) =>
                  question.id === id ? updated : question,
                ),
            });
            callbacks.next(updated);
          },
          error: (error: unknown): void => {
            callbacks.error(toErrorMessage(error));
          },
        });
      },
    }),
  ),
);
