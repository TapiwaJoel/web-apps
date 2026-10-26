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
  CommentResponseDto,
  CreateCommentDto,
  GetCommentsQueryDto,
  UpdateCommentDto,
} from '../../dtos';
import { CommentsService } from '../../services';
import { HeaderPaginationParams, PaginateResult } from '../../../common';
import { CommentsState } from './comments.state.type';

const initialState: CommentsState = {
  comments: [],
  commentsLoading: false,
  commentsError: null,
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
 * Shared comments state for a single commentable target.
 *
 * Comments are always scoped to one commentable (`commentable` +
 * `commentableId`), so every `loadComments` call replaces the held comments
 * with the fetched page rather than merging across targets. There is no
 * load-once guard.
 */
export const CommentsStore: Type<
  {
    comments: Signal<CommentResponseDto[]>;
    commentsLoading: Signal<boolean>;
    commentsError: Signal<string | null>;
    loadComments: (
      query: GetCommentsQueryDto,
      page?: HeaderPaginationParams,
    ) => void;
    createComment: (
      dto: CreateCommentDto,
      callbacks: {
        next: (comment: CommentResponseDto) => void;
        error: (message: string) => void;
      },
    ) => void;
    updateComment: (
      id: string,
      dto: UpdateCommentDto,
      callbacks: {
        next: (comment: CommentResponseDto) => void;
        error: (message: string) => void;
      },
    ) => void;
  } & StateSource<CommentsState>
> = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (
      store: StateSignals<CommentsState> & WritableStateSource<CommentsState>,
      commentsService: CommentsService = inject(CommentsService),
    ): {
      loadComments: (
        query: GetCommentsQueryDto,
        page?: HeaderPaginationParams,
      ) => void;
      createComment: (
        dto: CreateCommentDto,
        callbacks: {
          next: (comment: CommentResponseDto) => void;
          error: (message: string) => void;
        },
      ) => void;
      updateComment: (
        id: string,
        dto: UpdateCommentDto,
        callbacks: {
          next: (comment: CommentResponseDto) => void;
          error: (message: string) => void;
        },
      ) => void;
    } => ({
      loadComments(
        query: GetCommentsQueryDto,
        page?: HeaderPaginationParams,
      ): void {
        patchState(store, {
          commentsLoading: true,
          commentsError: null,
        });

        commentsService.list(query, page ?? {}).subscribe({
          next: (result: PaginateResult<CommentResponseDto>): void => {
            patchState(store, {
              comments: result.docs,
              commentsLoading: false,
            });
          },
          error: (error: unknown): void => {
            patchState(store, {
              commentsLoading: false,
              commentsError: toErrorMessage(error),
            });
          },
        });
      },

      createComment(
        dto: CreateCommentDto,
        callbacks: {
          next: (comment: CommentResponseDto) => void;
          error: (message: string) => void;
        },
      ): void {
        commentsService.create(dto).subscribe({
          next: (created: CommentResponseDto): void => {
            patchState(store, {
              comments: [...store.comments(), created],
            });
            callbacks.next(created);
          },
          error: (error: unknown): void => {
            callbacks.error(toErrorMessage(error));
          },
        });
      },

      updateComment(
        id: string,
        dto: UpdateCommentDto,
        callbacks: {
          next: (comment: CommentResponseDto) => void;
          error: (message: string) => void;
        },
      ): void {
        commentsService.update(id, dto).subscribe({
          next: (updated: CommentResponseDto): void => {
            patchState(store, {
              comments: store
                .comments()
                .map((comment: CommentResponseDto) =>
                  comment.id === id ? updated : comment,
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
