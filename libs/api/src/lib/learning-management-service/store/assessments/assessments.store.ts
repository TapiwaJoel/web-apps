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
  AssessmentResponseDto,
  CreateAssessmentDto,
  GetAssessmentsQueryDto,
  UpdateAssessmentDto,
} from '../../dtos';
import { AssessmentsService } from '../../services';
import { Observable, map } from 'rxjs';
import { fetchAllOffsetPages, PaginateResult } from '../../../common';
import { AssessmentsState } from './assessments.state.type';

const initialState: AssessmentsState = {
  assessments: [],
  assessmentsLoaded: false,
  assessmentsLoading: false,
  assessmentsError: null,
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
 * Shared assessments state for the learning-management admin.
 *
 * Loaded once and kept in this root singleton so navigating away from and
 * back to the Assessments page reads already-fetched state instead of
 * refetching.
 */
export const AssessmentsStore: Type<
  {
    assessments: Signal<AssessmentResponseDto[]>;
    assessmentsLoaded: Signal<boolean>;
    assessmentsLoading: Signal<boolean>;
    assessmentsError: Signal<string | null>;
    loadAssessments: (query?: GetAssessmentsQueryDto) => void;
    createAssessment: (
      dto: CreateAssessmentDto,
      callbacks: {
        next: (assessment: AssessmentResponseDto) => void;
        error: (message: string) => void;
      },
    ) => void;
    updateAssessment: (
      id: string,
      dto: UpdateAssessmentDto,
      callbacks: {
        next: (assessment: AssessmentResponseDto) => void;
        error: (message: string) => void;
      },
    ) => void;
  } & StateSource<AssessmentsState>
> = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (
      store: StateSignals<AssessmentsState> &
        WritableStateSource<AssessmentsState>,
      assessmentsService: AssessmentsService = inject(AssessmentsService),
    ): {
      loadAssessments: (query?: GetAssessmentsQueryDto) => void;
      createAssessment: (
        dto: CreateAssessmentDto,
        callbacks: {
          next: (assessment: AssessmentResponseDto) => void;
          error: (message: string) => void;
        },
      ) => void;
      updateAssessment: (
        id: string,
        dto: UpdateAssessmentDto,
        callbacks: {
          next: (assessment: AssessmentResponseDto) => void;
          error: (message: string) => void;
        },
      ) => void;
    } => ({
      loadAssessments(query?: GetAssessmentsQueryDto): void {
        const isLoadAll: boolean = !query || Object.keys(query).length === 0;

        if (isLoadAll) {
          if (store.assessmentsLoaded() || store.assessmentsLoading()) {
            return;
          }
          patchState(store, {
            assessmentsLoading: true,
            assessmentsError: null,
          });
        }

        const toDocs: (
          result: PaginateResult<AssessmentResponseDto>,
        ) => AssessmentResponseDto[] = (
          result: PaginateResult<AssessmentResponseDto>,
        ): AssessmentResponseDto[] => result.docs;
        const items$: Observable<AssessmentResponseDto[]> = isLoadAll
          ? fetchAllOffsetPages(
              (
                limit: number,
                offset: number,
              ): Observable<AssessmentResponseDto[]> =>
                assessmentsService.list({ limit, offset }).pipe(map(toDocs)),
            )
          : assessmentsService.list(query ?? {}).pipe(map(toDocs));

        items$.subscribe({
          next: (docs: AssessmentResponseDto[]): void => {
            if (isLoadAll) {
              patchState(store, {
                assessments: docs,
                assessmentsLoaded: true,
                assessmentsLoading: false,
              });
            } else {
              const existingIds: Set<string> = new Set(
                store
                  .assessments()
                  .map((item: AssessmentResponseDto) => item._id),
              );
              const newItems: AssessmentResponseDto[] = docs.filter(
                (item: AssessmentResponseDto) => !existingIds.has(item._id),
              );
              patchState(store, {
                assessments: [...store.assessments(), ...newItems],
              });
            }
          },
          error: (error: unknown): void => {
            if (isLoadAll) {
              patchState(store, {
                assessmentsLoading: false,
                assessmentsError: toErrorMessage(error),
              });
            }
          },
        });
      },

      createAssessment(
        dto: CreateAssessmentDto,
        callbacks: {
          next: (assessment: AssessmentResponseDto) => void;
          error: (message: string) => void;
        },
      ): void {
        assessmentsService.create(dto).subscribe({
          next: (created: AssessmentResponseDto): void => {
            patchState(store, {
              assessments: [...store.assessments(), created],
            });
            callbacks.next(created);
          },
          error: (error: unknown): void => {
            callbacks.error(toErrorMessage(error));
          },
        });
      },

      updateAssessment(
        id: string,
        dto: UpdateAssessmentDto,
        callbacks: {
          next: (assessment: AssessmentResponseDto) => void;
          error: (message: string) => void;
        },
      ): void {
        assessmentsService.update(id, dto).subscribe({
          next: (updated: AssessmentResponseDto): void => {
            patchState(store, {
              assessments: store
                .assessments()
                .map((assessment: AssessmentResponseDto) =>
                  assessment._id === id ? updated : assessment,
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
