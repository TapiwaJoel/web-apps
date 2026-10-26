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
  CreateExaminationBoardDto,
  GetExaminationBoardsQueryDto,
  UpdateExaminationBoardDto,
  ExaminationBoardResponseDto,
} from '../../dtos';
import { ExaminationBoardsService } from '../../services';
import { Observable, map } from 'rxjs';
import {
  fetchAllPages,
  HeaderPaginationParams,
  PaginateResult,
} from '../../../common';
import { ExaminationBoardsState } from './examination-boards.state.type';

const initialState: ExaminationBoardsState = {
  examinationBoards: [],
  examinationBoardsLoaded: false,
  examinationBoardsLoading: false,
  examinationBoardsError: null,
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
 * Shared examination-boards state for the learning-management admin.
 *
 * Loaded once and kept in this root singleton so navigating away from and
 * back to the Examination Boards page reads already-fetched state instead of
 * refetching.
 */
export const ExaminationBoardsStore: Type<
  {
    examinationBoards: Signal<ExaminationBoardResponseDto[]>;
    examinationBoardsLoaded: Signal<boolean>;
    examinationBoardsLoading: Signal<boolean>;
    examinationBoardsError: Signal<string | null>;
    loadExaminationBoards: (
      query?: GetExaminationBoardsQueryDto,
      page?: HeaderPaginationParams,
    ) => void;
    createExaminationBoard: (
      dto: CreateExaminationBoardDto,
      callbacks: {
        next: (examinationBoard: ExaminationBoardResponseDto) => void;
        error: (message: string) => void;
      },
    ) => void;
    updateExaminationBoard: (
      id: string,
      dto: UpdateExaminationBoardDto,
      callbacks: {
        next: (examinationBoard: ExaminationBoardResponseDto) => void;
        error: (message: string) => void;
      },
    ) => void;
  } & StateSource<ExaminationBoardsState>
> = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (
      store: StateSignals<ExaminationBoardsState> &
        WritableStateSource<ExaminationBoardsState>,
      examinationBoardsService: ExaminationBoardsService = inject(
        ExaminationBoardsService,
      ),
    ): {
      loadExaminationBoards: (
        query?: GetExaminationBoardsQueryDto,
        page?: HeaderPaginationParams,
      ) => void;
      createExaminationBoard: (
        dto: CreateExaminationBoardDto,
        callbacks: {
          next: (examinationBoard: ExaminationBoardResponseDto) => void;
          error: (message: string) => void;
        },
      ) => void;
      updateExaminationBoard: (
        id: string,
        dto: UpdateExaminationBoardDto,
        callbacks: {
          next: (examinationBoard: ExaminationBoardResponseDto) => void;
          error: (message: string) => void;
        },
      ) => void;
    } => ({
      loadExaminationBoards(
        query?: GetExaminationBoardsQueryDto,
        page?: HeaderPaginationParams,
      ): void {
        const isLoadAll: boolean =
          (!query || Object.keys(query).length === 0) &&
          (!page || Object.keys(page).length === 0);

        if (isLoadAll) {
          if (
            store.examinationBoardsLoaded() ||
            store.examinationBoardsLoading()
          ) {
            return;
          }
          patchState(store, {
            examinationBoardsLoading: true,
            examinationBoardsError: null,
          });
        }

        const items$: Observable<ExaminationBoardResponseDto[]> = isLoadAll
          ? fetchAllPages(
              (
                allPage: HeaderPaginationParams,
              ): Observable<PaginateResult<ExaminationBoardResponseDto>> =>
                examinationBoardsService.list({}, allPage),
            )
          : examinationBoardsService
              .list(query ?? {}, page ?? {})
              .pipe(
                map(
                  (
                    result: PaginateResult<ExaminationBoardResponseDto>,
                  ): ExaminationBoardResponseDto[] => result.docs,
                ),
              );

        items$.subscribe({
          next: (docs: ExaminationBoardResponseDto[]): void => {
            if (isLoadAll) {
              patchState(store, {
                examinationBoards: docs,
                examinationBoardsLoaded: true,
                examinationBoardsLoading: false,
              });
            } else {
              const existingIds: Set<string> = new Set(
                store
                  .examinationBoards()
                  .map((item: ExaminationBoardResponseDto) => item._id),
              );
              const newItems: ExaminationBoardResponseDto[] = docs.filter(
                (item: ExaminationBoardResponseDto) =>
                  !existingIds.has(item._id),
              );
              patchState(store, {
                examinationBoards: [...store.examinationBoards(), ...newItems],
              });
            }
          },
          error: (error: unknown): void => {
            if (isLoadAll) {
              patchState(store, {
                examinationBoardsLoading: false,
                examinationBoardsError: toErrorMessage(error),
              });
            }
          },
        });
      },

      createExaminationBoard(
        dto: CreateExaminationBoardDto,
        callbacks: {
          next: (examinationBoard: ExaminationBoardResponseDto) => void;
          error: (message: string) => void;
        },
      ): void {
        examinationBoardsService.create(dto).subscribe({
          next: (created: ExaminationBoardResponseDto): void => {
            patchState(store, {
              examinationBoards: [...store.examinationBoards(), created],
            });
            callbacks.next(created);
          },
          error: (error: unknown): void => {
            callbacks.error(toErrorMessage(error));
          },
        });
      },

      updateExaminationBoard(
        id: string,
        dto: UpdateExaminationBoardDto,
        callbacks: {
          next: (examinationBoard: ExaminationBoardResponseDto) => void;
          error: (message: string) => void;
        },
      ): void {
        examinationBoardsService.update(id, dto).subscribe({
          next: (updated: ExaminationBoardResponseDto): void => {
            patchState(store, {
              examinationBoards: store
                .examinationBoards()
                .map((examinationBoard: ExaminationBoardResponseDto) =>
                  examinationBoard._id === id ? updated : examinationBoard,
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
