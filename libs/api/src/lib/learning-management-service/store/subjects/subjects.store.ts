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
  CreateSubjectDto,
  GetSubjectsQueryDto,
  UpdateSubjectDto,
  SubjectResponseDto,
} from '../../dtos';
import { SubjectsService } from '../../services';
import { Observable, map } from 'rxjs';
import {
  fetchAllPages,
  HeaderPaginationParams,
  PaginateResult,
} from '../../../common';
import { SubjectsState } from './subjects.state.type';

const initialState: SubjectsState = {
  subjects: [],
  subjectsLoaded: false,
  subjectsLoading: false,
  subjectsError: null,
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
 * Shared subjects state for the learning-management admin.
 *
 * Loaded once and kept in this root singleton so navigating away from and
 * back to the Subjects page reads already-fetched state instead of
 * refetching.
 */
export const SubjectsStore: Type<
  {
    subjects: Signal<SubjectResponseDto[]>;
    subjectsLoaded: Signal<boolean>;
    subjectsLoading: Signal<boolean>;
    subjectsError: Signal<string | null>;
    loadSubjects: (
      query?: GetSubjectsQueryDto,
      page?: HeaderPaginationParams,
    ) => void;
    createSubject: (
      dto: CreateSubjectDto,
      callbacks: {
        next: (subject: SubjectResponseDto) => void;
        error: (message: string) => void;
      },
    ) => void;
    updateSubject: (
      id: string,
      dto: UpdateSubjectDto,
      callbacks: {
        next: (subject: SubjectResponseDto) => void;
        error: (message: string) => void;
      },
    ) => void;
  } & StateSource<SubjectsState>
> = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (
      store: StateSignals<SubjectsState> & WritableStateSource<SubjectsState>,
      subjectsService: SubjectsService = inject(SubjectsService),
    ): {
      loadSubjects: (
        query?: GetSubjectsQueryDto,
        page?: HeaderPaginationParams,
      ) => void;
      createSubject: (
        dto: CreateSubjectDto,
        callbacks: {
          next: (subject: SubjectResponseDto) => void;
          error: (message: string) => void;
        },
      ) => void;
      updateSubject: (
        id: string,
        dto: UpdateSubjectDto,
        callbacks: {
          next: (subject: SubjectResponseDto) => void;
          error: (message: string) => void;
        },
      ) => void;
    } => ({
      loadSubjects(
        query?: GetSubjectsQueryDto,
        page?: HeaderPaginationParams,
      ): void {
        const isLoadAll: boolean =
          (!query || Object.keys(query).length === 0) &&
          (!page || Object.keys(page).length === 0);

        if (isLoadAll) {
          if (store.subjectsLoaded() || store.subjectsLoading()) {
            return;
          }
          patchState(store, {
            subjectsLoading: true,
            subjectsError: null,
          });
        }

        const items$: Observable<SubjectResponseDto[]> = isLoadAll
          ? fetchAllPages(
              (
                allPage: HeaderPaginationParams,
              ): Observable<PaginateResult<SubjectResponseDto>> =>
                subjectsService.list({}, allPage),
            )
          : subjectsService
              .list(query ?? {}, page ?? {})
              .pipe(
                map(
                  (
                    result: PaginateResult<SubjectResponseDto>,
                  ): SubjectResponseDto[] => result.docs,
                ),
              );

        items$.subscribe({
          next: (docs: SubjectResponseDto[]): void => {
            if (isLoadAll) {
              patchState(store, {
                subjects: docs,
                subjectsLoaded: true,
                subjectsLoading: false,
              });
            } else {
              const existingIds: Set<string> = new Set(
                store.subjects().map((item: SubjectResponseDto) => item._id),
              );
              const newItems: SubjectResponseDto[] = docs.filter(
                (item: SubjectResponseDto) => !existingIds.has(item._id),
              );
              patchState(store, {
                subjects: [...store.subjects(), ...newItems],
              });
            }
          },
          error: (error: unknown): void => {
            if (isLoadAll) {
              patchState(store, {
                subjectsLoading: false,
                subjectsError: toErrorMessage(error),
              });
            }
          },
        });
      },

      createSubject(
        dto: CreateSubjectDto,
        callbacks: {
          next: (subject: SubjectResponseDto) => void;
          error: (message: string) => void;
        },
      ): void {
        subjectsService.create(dto).subscribe({
          next: (created: SubjectResponseDto): void => {
            patchState(store, {
              subjects: [...store.subjects(), created],
            });
            callbacks.next(created);
          },
          error: (error: unknown): void => {
            callbacks.error(toErrorMessage(error));
          },
        });
      },

      updateSubject(
        id: string,
        dto: UpdateSubjectDto,
        callbacks: {
          next: (subject: SubjectResponseDto) => void;
          error: (message: string) => void;
        },
      ): void {
        subjectsService.update(id, dto).subscribe({
          next: (updated: SubjectResponseDto): void => {
            patchState(store, {
              subjects: store
                .subjects()
                .map((subject: SubjectResponseDto) =>
                  subject._id === id ? updated : subject,
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
