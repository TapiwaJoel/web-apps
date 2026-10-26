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
  CreateExaminationDto,
  GetExaminationsQueryDto,
  UpdateExaminationDto,
  ExaminationResponseDto,
} from '../../dtos';
import { ExaminationsService } from '../../services';
import { Observable, map } from 'rxjs';
import {
  fetchAllPages,
  HeaderPaginationParams,
  PaginateResult,
} from '../../../common';
import { ExaminationsState } from './examinations.state.type';

const initialState: ExaminationsState = {
  examinations: [],
  examinationsLoaded: false,
  examinationsLoading: false,
  examinationsError: null,
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
 * Shared examinations state for the learning-management admin.
 *
 * Loaded once and kept in this root singleton so navigating away from and
 * back to the Examinations page reads already-fetched state instead of
 * refetching.
 */
export const ExaminationsStore: Type<
  {
    examinations: Signal<ExaminationResponseDto[]>;
    examinationsLoaded: Signal<boolean>;
    examinationsLoading: Signal<boolean>;
    examinationsError: Signal<string | null>;
    loadExaminations: (
      query?: GetExaminationsQueryDto,
      page?: HeaderPaginationParams,
    ) => void;
    createExamination: (
      dto: CreateExaminationDto,
      callbacks: {
        next: (examination: ExaminationResponseDto) => void;
        error: (message: string) => void;
      },
    ) => void;
    updateExamination: (
      id: string,
      dto: UpdateExaminationDto,
      callbacks: {
        next: (examination: ExaminationResponseDto) => void;
        error: (message: string) => void;
      },
    ) => void;
  } & StateSource<ExaminationsState>
> = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (
      store: StateSignals<ExaminationsState> &
        WritableStateSource<ExaminationsState>,
      examinationsService: ExaminationsService = inject(ExaminationsService),
    ): {
      loadExaminations: (
        query?: GetExaminationsQueryDto,
        page?: HeaderPaginationParams,
      ) => void;
      createExamination: (
        dto: CreateExaminationDto,
        callbacks: {
          next: (examination: ExaminationResponseDto) => void;
          error: (message: string) => void;
        },
      ) => void;
      updateExamination: (
        id: string,
        dto: UpdateExaminationDto,
        callbacks: {
          next: (examination: ExaminationResponseDto) => void;
          error: (message: string) => void;
        },
      ) => void;
    } => ({
      loadExaminations(
        query?: GetExaminationsQueryDto,
        page?: HeaderPaginationParams,
      ): void {
        const isLoadAll: boolean =
          (!query || Object.keys(query).length === 0) &&
          (!page || Object.keys(page).length === 0);

        if (isLoadAll) {
          if (store.examinationsLoaded() || store.examinationsLoading()) {
            return;
          }
          patchState(store, {
            examinationsLoading: true,
            examinationsError: null,
          });
        }

        const items$: Observable<ExaminationResponseDto[]> = isLoadAll
          ? fetchAllPages(
              (
                allPage: HeaderPaginationParams,
              ): Observable<PaginateResult<ExaminationResponseDto>> =>
                examinationsService.list({}, allPage),
            )
          : examinationsService
              .list(query ?? {}, page ?? {})
              .pipe(
                map(
                  (
                    result: PaginateResult<ExaminationResponseDto>,
                  ): ExaminationResponseDto[] => result.docs,
                ),
              );

        items$.subscribe({
          next: (docs: ExaminationResponseDto[]): void => {
            if (isLoadAll) {
              patchState(store, {
                examinations: docs,
                examinationsLoaded: true,
                examinationsLoading: false,
              });
            } else {
              const existingIds: Set<string> = new Set(
                store
                  .examinations()
                  .map((item: ExaminationResponseDto) => item._id),
              );
              const newItems: ExaminationResponseDto[] = docs.filter(
                (item: ExaminationResponseDto) => !existingIds.has(item._id),
              );
              patchState(store, {
                examinations: [...store.examinations(), ...newItems],
              });
            }
          },
          error: (error: unknown): void => {
            if (isLoadAll) {
              patchState(store, {
                examinationsLoading: false,
                examinationsError: toErrorMessage(error),
              });
            }
          },
        });
      },

      createExamination(
        dto: CreateExaminationDto,
        callbacks: {
          next: (examination: ExaminationResponseDto) => void;
          error: (message: string) => void;
        },
      ): void {
        examinationsService.create(dto).subscribe({
          next: (created: ExaminationResponseDto): void => {
            patchState(store, {
              examinations: [...store.examinations(), created],
            });
            callbacks.next(created);
          },
          error: (error: unknown): void => {
            callbacks.error(toErrorMessage(error));
          },
        });
      },

      updateExamination(
        id: string,
        dto: UpdateExaminationDto,
        callbacks: {
          next: (examination: ExaminationResponseDto) => void;
          error: (message: string) => void;
        },
      ): void {
        examinationsService.update(id, dto).subscribe({
          next: (updated: ExaminationResponseDto): void => {
            patchState(store, {
              examinations: store
                .examinations()
                .map((examination: ExaminationResponseDto) =>
                  examination._id === id ? updated : examination,
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
