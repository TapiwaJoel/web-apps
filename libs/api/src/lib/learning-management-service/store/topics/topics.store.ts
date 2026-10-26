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
  CreateTopicDto,
  GetTopicsQueryDto,
  UpdateTopicDto,
  TopicResponseDto,
} from '../../dtos';
import { TopicsService } from '../../services';
import { Observable, map } from 'rxjs';
import {
  fetchAllPages,
  HeaderPaginationParams,
  PaginateResult,
} from '../../../common';
import { TopicsState } from './topics.state.type';

const initialState: TopicsState = {
  topics: [],
  topicsLoaded: false,
  topicsLoading: false,
  topicsError: null,
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
 * Shared topics state for the learning-management admin.
 *
 * Loaded once and kept in this root singleton so navigating away from and
 * back to the Topics page reads already-fetched state instead of
 * refetching.
 */
export const TopicsStore: Type<
  {
    topics: Signal<TopicResponseDto[]>;
    topicsLoaded: Signal<boolean>;
    topicsLoading: Signal<boolean>;
    topicsError: Signal<string | null>;
    loadTopics: (
      query?: GetTopicsQueryDto,
      page?: HeaderPaginationParams,
    ) => void;
    createTopic: (
      dto: CreateTopicDto,
      callbacks: {
        next: (topic: TopicResponseDto) => void;
        error: (message: string) => void;
      },
    ) => void;
    updateTopic: (
      id: string,
      dto: UpdateTopicDto,
      callbacks: {
        next: (topic: TopicResponseDto) => void;
        error: (message: string) => void;
      },
    ) => void;
  } & StateSource<TopicsState>
> = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (
      store: StateSignals<TopicsState> & WritableStateSource<TopicsState>,
      topicsService: TopicsService = inject(TopicsService),
    ): {
      loadTopics: (
        query?: GetTopicsQueryDto,
        page?: HeaderPaginationParams,
      ) => void;
      createTopic: (
        dto: CreateTopicDto,
        callbacks: {
          next: (topic: TopicResponseDto) => void;
          error: (message: string) => void;
        },
      ) => void;
      updateTopic: (
        id: string,
        dto: UpdateTopicDto,
        callbacks: {
          next: (topic: TopicResponseDto) => void;
          error: (message: string) => void;
        },
      ) => void;
    } => ({
      loadTopics(
        query?: GetTopicsQueryDto,
        page?: HeaderPaginationParams,
      ): void {
        const isLoadAll: boolean =
          (!query || Object.keys(query).length === 0) &&
          (!page || Object.keys(page).length === 0);

        if (isLoadAll) {
          if (store.topicsLoaded() || store.topicsLoading()) {
            return;
          }
          patchState(store, {
            topicsLoading: true,
            topicsError: null,
          });
        }

        const items$: Observable<TopicResponseDto[]> = isLoadAll
          ? fetchAllPages(
              (
                allPage: HeaderPaginationParams,
              ): Observable<PaginateResult<TopicResponseDto>> =>
                topicsService.list({}, allPage),
            )
          : topicsService
              .list(query ?? {}, page ?? {})
              .pipe(
                map(
                  (
                    result: PaginateResult<TopicResponseDto>,
                  ): TopicResponseDto[] => result.docs,
                ),
              );

        items$.subscribe({
          next: (docs: TopicResponseDto[]): void => {
            if (isLoadAll) {
              patchState(store, {
                topics: docs,
                topicsLoaded: true,
                topicsLoading: false,
              });
            } else {
              const existingIds: Set<string> = new Set(
                store.topics().map((item: TopicResponseDto) => item._id),
              );
              const newItems: TopicResponseDto[] = docs.filter(
                (item: TopicResponseDto) => !existingIds.has(item._id),
              );
              patchState(store, {
                topics: [...store.topics(), ...newItems],
              });
            }
          },
          error: (error: unknown): void => {
            if (isLoadAll) {
              patchState(store, {
                topicsLoading: false,
                topicsError: toErrorMessage(error),
              });
            }
          },
        });
      },

      createTopic(
        dto: CreateTopicDto,
        callbacks: {
          next: (topic: TopicResponseDto) => void;
          error: (message: string) => void;
        },
      ): void {
        topicsService.create(dto).subscribe({
          next: (created: TopicResponseDto): void => {
            patchState(store, {
              topics: [...store.topics(), created],
            });
            callbacks.next(created);
          },
          error: (error: unknown): void => {
            callbacks.error(toErrorMessage(error));
          },
        });
      },

      updateTopic(
        id: string,
        dto: UpdateTopicDto,
        callbacks: {
          next: (topic: TopicResponseDto) => void;
          error: (message: string) => void;
        },
      ): void {
        topicsService.update(id, dto).subscribe({
          next: (updated: TopicResponseDto): void => {
            patchState(store, {
              topics: store
                .topics()
                .map((topic: TopicResponseDto) =>
                  topic._id === id ? updated : topic,
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
