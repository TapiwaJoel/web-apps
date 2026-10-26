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
  CreateExaminationPaperDto,
  GetExaminationPapersQueryDto,
  UpdateExaminationPaperDto,
  ExaminationPaperResponseDto,
} from '../../dtos';
import { ExaminationPapersService } from '../../services';
import { Observable, map } from 'rxjs';
import {
  fetchAllPages,
  HeaderPaginationParams,
  PaginateResult,
} from '../../../common';
import { ExaminationPapersState } from './examination-papers.state.type';

const initialState: ExaminationPapersState = {
  examinationPapers: [],
  examinationPapersLoaded: false,
  examinationPapersLoading: false,
  examinationPapersError: null,
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
 * Shared examination-papers state for the learning-management admin.
 *
 * Loaded once and kept in this root singleton so navigating away from and
 * back to the Examination Papers page reads already-fetched state instead of
 * refetching.
 */
export const ExaminationPapersStore: Type<
  {
    examinationPapers: Signal<ExaminationPaperResponseDto[]>;
    examinationPapersLoaded: Signal<boolean>;
    examinationPapersLoading: Signal<boolean>;
    examinationPapersError: Signal<string | null>;
    loadExaminationPapers: (
      query?: GetExaminationPapersQueryDto,
      page?: HeaderPaginationParams,
    ) => void;
    createExaminationPaper: (
      dto: CreateExaminationPaperDto,
      callbacks: {
        next: (examinationPaper: ExaminationPaperResponseDto) => void;
        error: (message: string) => void;
      },
    ) => void;
    updateExaminationPaper: (
      id: string,
      dto: UpdateExaminationPaperDto,
      callbacks: {
        next: (examinationPaper: ExaminationPaperResponseDto) => void;
        error: (message: string) => void;
      },
    ) => void;
  } & StateSource<ExaminationPapersState>
> = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (
      store: StateSignals<ExaminationPapersState> &
        WritableStateSource<ExaminationPapersState>,
      examinationPapersService: ExaminationPapersService = inject(
        ExaminationPapersService,
      ),
    ): {
      loadExaminationPapers: (
        query?: GetExaminationPapersQueryDto,
        page?: HeaderPaginationParams,
      ) => void;
      createExaminationPaper: (
        dto: CreateExaminationPaperDto,
        callbacks: {
          next: (examinationPaper: ExaminationPaperResponseDto) => void;
          error: (message: string) => void;
        },
      ) => void;
      updateExaminationPaper: (
        id: string,
        dto: UpdateExaminationPaperDto,
        callbacks: {
          next: (examinationPaper: ExaminationPaperResponseDto) => void;
          error: (message: string) => void;
        },
      ) => void;
    } => ({
      loadExaminationPapers(
        query?: GetExaminationPapersQueryDto,
        page?: HeaderPaginationParams,
      ): void {
        const isLoadAll: boolean =
          (!query || Object.keys(query).length === 0) &&
          (!page || Object.keys(page).length === 0);

        if (isLoadAll) {
          if (
            store.examinationPapersLoaded() ||
            store.examinationPapersLoading()
          ) {
            return;
          }
          patchState(store, {
            examinationPapersLoading: true,
            examinationPapersError: null,
          });
        }

        const items$: Observable<ExaminationPaperResponseDto[]> = isLoadAll
          ? fetchAllPages(
              (
                allPage: HeaderPaginationParams,
              ): Observable<PaginateResult<ExaminationPaperResponseDto>> =>
                examinationPapersService.list({}, allPage),
            )
          : examinationPapersService
              .list(query ?? {}, page ?? {})
              .pipe(
                map(
                  (
                    result: PaginateResult<ExaminationPaperResponseDto>,
                  ): ExaminationPaperResponseDto[] => result.docs,
                ),
              );

        items$.subscribe({
          next: (docs: ExaminationPaperResponseDto[]): void => {
            if (isLoadAll) {
              patchState(store, {
                examinationPapers: docs,
                examinationPapersLoaded: true,
                examinationPapersLoading: false,
              });
            } else {
              const existingIds: Set<string> = new Set(
                store
                  .examinationPapers()
                  .map((item: ExaminationPaperResponseDto) => item._id),
              );
              const newItems: ExaminationPaperResponseDto[] = docs.filter(
                (item: ExaminationPaperResponseDto) =>
                  !existingIds.has(item._id),
              );
              patchState(store, {
                examinationPapers: [...store.examinationPapers(), ...newItems],
              });
            }
          },
          error: (error: unknown): void => {
            if (isLoadAll) {
              patchState(store, {
                examinationPapersLoading: false,
                examinationPapersError: toErrorMessage(error),
              });
            }
          },
        });
      },

      createExaminationPaper(
        dto: CreateExaminationPaperDto,
        callbacks: {
          next: (examinationPaper: ExaminationPaperResponseDto) => void;
          error: (message: string) => void;
        },
      ): void {
        examinationPapersService.create(dto).subscribe({
          next: (created: ExaminationPaperResponseDto): void => {
            patchState(store, {
              examinationPapers: [...store.examinationPapers(), created],
            });
            callbacks.next(created);
          },
          error: (error: unknown): void => {
            callbacks.error(toErrorMessage(error));
          },
        });
      },

      updateExaminationPaper(
        id: string,
        dto: UpdateExaminationPaperDto,
        callbacks: {
          next: (examinationPaper: ExaminationPaperResponseDto) => void;
          error: (message: string) => void;
        },
      ): void {
        examinationPapersService.update(id, dto).subscribe({
          next: (updated: ExaminationPaperResponseDto): void => {
            patchState(store, {
              examinationPapers: store
                .examinationPapers()
                .map((examinationPaper: ExaminationPaperResponseDto) =>
                  examinationPaper._id === id ? updated : examinationPaper,
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
