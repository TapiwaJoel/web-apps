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
  ContentProgressResponseDto,
  CreateBookmarkDto,
  CreateContentProgressDto,
  GetContentProgressQueryDto,
  UpdateContentProgressDto,
} from '../../dtos';
import { ContentProgressService } from '../../services';
import { Observable, map } from 'rxjs';
import {
  fetchAllPages,
  HeaderPaginationParams,
  PaginateResult,
} from '../../../common';
import { ContentProgressState } from './content-progress.state.type';

const initialState: ContentProgressState = {
  contentProgress: [],
  contentProgressLoaded: false,
  contentProgressLoading: false,
  contentProgressError: null,
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
 * Shared content-progress state.
 *
 * Loaded once and kept in this root singleton so navigating away from and
 * back to a page that lists content progress reads already-fetched state
 * instead of refetching. Query-scoped loads merge into the existing list.
 */
export const ContentProgressStore: Type<
  {
    contentProgress: Signal<ContentProgressResponseDto[]>;
    contentProgressLoaded: Signal<boolean>;
    contentProgressLoading: Signal<boolean>;
    contentProgressError: Signal<string | null>;
    loadContentProgress: (
      query?: GetContentProgressQueryDto,
      page?: HeaderPaginationParams,
    ) => void;
    createContentProgress: (
      dto: CreateContentProgressDto,
      callbacks: {
        next: (contentProgress: ContentProgressResponseDto) => void;
        error: (message: string) => void;
      },
    ) => void;
    updateContentProgress: (
      contentId: string,
      systemUserId: string,
      dto: UpdateContentProgressDto,
      callbacks: {
        next: (contentProgress: ContentProgressResponseDto) => void;
        error: (message: string) => void;
      },
    ) => void;
    removeContentProgress: (
      progressId: string,
      callbacks: { next: () => void; error: (message: string) => void },
    ) => void;
    addBookmark: (
      progressId: string,
      dto: CreateBookmarkDto,
      callbacks: {
        next: (contentProgress: ContentProgressResponseDto) => void;
        error: (message: string) => void;
      },
    ) => void;
    removeBookmark: (
      progressId: string,
      position: number,
      callbacks: {
        next: (contentProgress: ContentProgressResponseDto) => void;
        error: (message: string) => void;
      },
    ) => void;
  } & StateSource<ContentProgressState>
> = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (
      store: StateSignals<ContentProgressState> &
        WritableStateSource<ContentProgressState>,
      contentProgressService: ContentProgressService = inject(
        ContentProgressService,
      ),
    ): {
      loadContentProgress: (
        query?: GetContentProgressQueryDto,
        page?: HeaderPaginationParams,
      ) => void;
      createContentProgress: (
        dto: CreateContentProgressDto,
        callbacks: {
          next: (contentProgress: ContentProgressResponseDto) => void;
          error: (message: string) => void;
        },
      ) => void;
      updateContentProgress: (
        contentId: string,
        systemUserId: string,
        dto: UpdateContentProgressDto,
        callbacks: {
          next: (contentProgress: ContentProgressResponseDto) => void;
          error: (message: string) => void;
        },
      ) => void;
      removeContentProgress: (
        progressId: string,
        callbacks: { next: () => void; error: (message: string) => void },
      ) => void;
      addBookmark: (
        progressId: string,
        dto: CreateBookmarkDto,
        callbacks: {
          next: (contentProgress: ContentProgressResponseDto) => void;
          error: (message: string) => void;
        },
      ) => void;
      removeBookmark: (
        progressId: string,
        position: number,
        callbacks: {
          next: (contentProgress: ContentProgressResponseDto) => void;
          error: (message: string) => void;
        },
      ) => void;
    } => {
      /** Replaces the item with the same `_id` as `updated`. */
      function replaceById(updated: ContentProgressResponseDto): void {
        patchState(store, {
          contentProgress: store
            .contentProgress()
            .map((item: ContentProgressResponseDto) =>
              item._id === updated._id ? updated : item,
            ),
        });
      }

      return {
        loadContentProgress(
          query?: GetContentProgressQueryDto,
          page?: HeaderPaginationParams,
        ): void {
          const isLoadAll: boolean =
            (!query || Object.keys(query).length === 0) &&
            (!page || Object.keys(page).length === 0);

          if (isLoadAll) {
            if (
              store.contentProgressLoaded() ||
              store.contentProgressLoading()
            ) {
              return;
            }
            patchState(store, {
              contentProgressLoading: true,
              contentProgressError: null,
            });
          }

          const items$: Observable<ContentProgressResponseDto[]> = isLoadAll
            ? fetchAllPages(
                (
                  allPage: HeaderPaginationParams,
                ): Observable<PaginateResult<ContentProgressResponseDto>> =>
                  contentProgressService.list({}, allPage),
              )
            : contentProgressService
                .list(query ?? {}, page ?? {})
                .pipe(
                  map(
                    (
                      result: PaginateResult<ContentProgressResponseDto>,
                    ): ContentProgressResponseDto[] => result.docs,
                  ),
                );

          items$.subscribe({
            next: (docs: ContentProgressResponseDto[]): void => {
              if (isLoadAll) {
                patchState(store, {
                  contentProgress: docs,
                  contentProgressLoaded: true,
                  contentProgressLoading: false,
                });
              } else {
                const existingIds: Set<string> = new Set(
                  store
                    .contentProgress()
                    .map((item: ContentProgressResponseDto) => item._id),
                );
                const newItems: ContentProgressResponseDto[] = docs.filter(
                  (item: ContentProgressResponseDto) =>
                    !existingIds.has(item._id),
                );
                patchState(store, {
                  contentProgress: [...store.contentProgress(), ...newItems],
                });
              }
            },
            error: (error: unknown): void => {
              if (isLoadAll) {
                patchState(store, {
                  contentProgressLoading: false,
                  contentProgressError: toErrorMessage(error),
                });
              }
            },
          });
        },

        createContentProgress(
          dto: CreateContentProgressDto,
          callbacks: {
            next: (contentProgress: ContentProgressResponseDto) => void;
            error: (message: string) => void;
          },
        ): void {
          contentProgressService.create(dto).subscribe({
            next: (created: ContentProgressResponseDto): void => {
              patchState(store, {
                contentProgress: [...store.contentProgress(), created],
              });
              callbacks.next(created);
            },
            error: (error: unknown): void => {
              callbacks.error(toErrorMessage(error));
            },
          });
        },

        updateContentProgress(
          contentId: string,
          systemUserId: string,
          dto: UpdateContentProgressDto,
          callbacks: {
            next: (contentProgress: ContentProgressResponseDto) => void;
            error: (message: string) => void;
          },
        ): void {
          contentProgressService
            .update(contentId, systemUserId, dto)
            .subscribe({
              next: (updated: ContentProgressResponseDto): void => {
                patchState(store, {
                  contentProgress: store
                    .contentProgress()
                    .map((item: ContentProgressResponseDto) =>
                      item.contentId === contentId &&
                      item.systemUserId === systemUserId
                        ? updated
                        : item,
                    ),
                });
                callbacks.next(updated);
              },
              error: (error: unknown): void => {
                callbacks.error(toErrorMessage(error));
              },
            });
        },

        removeContentProgress(
          progressId: string,
          callbacks: { next: () => void; error: (message: string) => void },
        ): void {
          contentProgressService.remove(progressId).subscribe({
            next: (): void => {
              patchState(store, {
                contentProgress: store
                  .contentProgress()
                  .filter(
                    (item: ContentProgressResponseDto) =>
                      item._id !== progressId,
                  ),
              });
              callbacks.next();
            },
            error: (error: unknown): void => {
              callbacks.error(toErrorMessage(error));
            },
          });
        },

        addBookmark(
          progressId: string,
          dto: CreateBookmarkDto,
          callbacks: {
            next: (contentProgress: ContentProgressResponseDto) => void;
            error: (message: string) => void;
          },
        ): void {
          contentProgressService.addBookmark(progressId, dto).subscribe({
            next: (updated: ContentProgressResponseDto): void => {
              replaceById(updated);
              callbacks.next(updated);
            },
            error: (error: unknown): void => {
              callbacks.error(toErrorMessage(error));
            },
          });
        },

        removeBookmark(
          progressId: string,
          position: number,
          callbacks: {
            next: (contentProgress: ContentProgressResponseDto) => void;
            error: (message: string) => void;
          },
        ): void {
          contentProgressService
            .removeBookmark(progressId, position)
            .subscribe({
              next: (updated: ContentProgressResponseDto): void => {
                replaceById(updated);
                callbacks.next(updated);
              },
              error: (error: unknown): void => {
                callbacks.error(toErrorMessage(error));
              },
            });
        },
      };
    },
  ),
);
