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
  CreateGradeDto,
  GetGradesQueryDto,
  UpdateGradeDto,
  GradeResponseDto,
} from '../../dtos';
import { GradesService } from '../../services';
import { Observable, map } from 'rxjs';
import {
  fetchAllPages,
  HeaderPaginationParams,
  PaginateResult,
} from '../../../common';
import { GradesState } from './grades.state.type';

const initialState: GradesState = {
  grades: [],
  gradesLoaded: false,
  gradesLoading: false,
  gradesError: null,
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
 * Shared grades state for the learning-management admin.
 *
 * Loaded once and kept in this root singleton so navigating away from and
 * back to the Grades page reads already-fetched state instead of
 * refetching.
 */
export const GradesStore: Type<
  {
    grades: Signal<GradeResponseDto[]>;
    gradesLoaded: Signal<boolean>;
    gradesLoading: Signal<boolean>;
    gradesError: Signal<string | null>;
    loadGrades: (
      query?: GetGradesQueryDto,
      page?: HeaderPaginationParams,
    ) => void;
    createGrade: (
      dto: CreateGradeDto,
      callbacks: {
        next: (grade: GradeResponseDto) => void;
        error: (message: string) => void;
      },
    ) => void;
    updateGrade: (
      id: string,
      dto: UpdateGradeDto,
      callbacks: {
        next: (grade: GradeResponseDto) => void;
        error: (message: string) => void;
      },
    ) => void;
  } & StateSource<GradesState>
> = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (
      store: StateSignals<GradesState> & WritableStateSource<GradesState>,
      gradesService: GradesService = inject(GradesService),
    ): {
      loadGrades: (
        query?: GetGradesQueryDto,
        page?: HeaderPaginationParams,
      ) => void;
      createGrade: (
        dto: CreateGradeDto,
        callbacks: {
          next: (grade: GradeResponseDto) => void;
          error: (message: string) => void;
        },
      ) => void;
      updateGrade: (
        id: string,
        dto: UpdateGradeDto,
        callbacks: {
          next: (grade: GradeResponseDto) => void;
          error: (message: string) => void;
        },
      ) => void;
    } => ({
      loadGrades(
        query?: GetGradesQueryDto,
        page?: HeaderPaginationParams,
      ): void {
        const isLoadAll: boolean =
          (!query || Object.keys(query).length === 0) &&
          (!page || Object.keys(page).length === 0);

        if (isLoadAll) {
          if (store.gradesLoaded() || store.gradesLoading()) {
            return;
          }
          patchState(store, {
            gradesLoading: true,
            gradesError: null,
          });
        }

        const items$: Observable<GradeResponseDto[]> = isLoadAll
          ? fetchAllPages(
              (
                allPage: HeaderPaginationParams,
              ): Observable<PaginateResult<GradeResponseDto>> =>
                gradesService.list({}, allPage),
            )
          : gradesService
              .list(query ?? {}, page ?? {})
              .pipe(
                map(
                  (
                    result: PaginateResult<GradeResponseDto>,
                  ): GradeResponseDto[] => result.docs,
                ),
              );

        items$.subscribe({
          next: (docs: GradeResponseDto[]): void => {
            if (isLoadAll) {
              patchState(store, {
                grades: docs,
                gradesLoaded: true,
                gradesLoading: false,
              });
            } else {
              const existingIds: Set<string> = new Set(
                store.grades().map((item: GradeResponseDto) => item._id),
              );
              const newItems: GradeResponseDto[] = docs.filter(
                (item: GradeResponseDto) => !existingIds.has(item._id),
              );
              patchState(store, {
                grades: [...store.grades(), ...newItems],
              });
            }
          },
          error: (error: unknown): void => {
            if (isLoadAll) {
              patchState(store, {
                gradesLoading: false,
                gradesError: toErrorMessage(error),
              });
            }
          },
        });
      },

      createGrade(
        dto: CreateGradeDto,
        callbacks: {
          next: (grade: GradeResponseDto) => void;
          error: (message: string) => void;
        },
      ): void {
        gradesService.create(dto).subscribe({
          next: (created: GradeResponseDto): void => {
            patchState(store, {
              grades: [...store.grades(), created],
            });
            callbacks.next(created);
          },
          error: (error: unknown): void => {
            callbacks.error(toErrorMessage(error));
          },
        });
      },

      updateGrade(
        id: string,
        dto: UpdateGradeDto,
        callbacks: {
          next: (grade: GradeResponseDto) => void;
          error: (message: string) => void;
        },
      ): void {
        gradesService.update(id, dto).subscribe({
          next: (updated: GradeResponseDto): void => {
            patchState(store, {
              grades: store
                .grades()
                .map((grade: GradeResponseDto) =>
                  grade._id === id ? updated : grade,
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
