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
  CreateSubTopicDto,
  GetSubTopicsQueryDto,
  UpdateSubTopicDto,
  SubTopicResponseDto,
} from '../../dtos';
import { SubTopicsService } from '../../services';
import { Observable, map } from 'rxjs';
import {
  fetchAllPages,
  HeaderPaginationParams,
  PaginateResult,
} from '../../../common';
import { SubTopicsState } from './sub-topics.state.type';

const initialState: SubTopicsState = {
  subTopics: [],
  subTopicsLoaded: false,
  subTopicsLoading: false,
  subTopicsError: null,
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
 * Shared sub-topics state for the learning-management admin.
 *
 * Loaded once and kept in this root singleton so navigating away from and
 * back to the Sub-Topics page reads already-fetched state instead of
 * refetching.
 */
export const SubTopicsStore: Type<
  {
    subTopics: Signal<SubTopicResponseDto[]>;
    subTopicsLoaded: Signal<boolean>;
    subTopicsLoading: Signal<boolean>;
    subTopicsError: Signal<string | null>;
    loadSubTopics: (
      query?: GetSubTopicsQueryDto,
      page?: HeaderPaginationParams,
    ) => void;
    createSubTopic: (
      dto: CreateSubTopicDto,
      callbacks: {
        next: (subTopic: SubTopicResponseDto) => void;
        error: (message: string) => void;
      },
    ) => void;
    updateSubTopic: (
      id: string,
      dto: UpdateSubTopicDto,
      callbacks: {
        next: (subTopic: SubTopicResponseDto) => void;
        error: (message: string) => void;
      },
    ) => void;
  } & StateSource<SubTopicsState>
> = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (
      store: StateSignals<SubTopicsState> & WritableStateSource<SubTopicsState>,
      subTopicsService: SubTopicsService = inject(SubTopicsService),
    ): {
      loadSubTopics: (
        query?: GetSubTopicsQueryDto,
        page?: HeaderPaginationParams,
      ) => void;
      createSubTopic: (
        dto: CreateSubTopicDto,
        callbacks: {
          next: (subTopic: SubTopicResponseDto) => void;
          error: (message: string) => void;
        },
      ) => void;
      updateSubTopic: (
        id: string,
        dto: UpdateSubTopicDto,
        callbacks: {
          next: (subTopic: SubTopicResponseDto) => void;
          error: (message: string) => void;
        },
      ) => void;
    } => ({
      loadSubTopics(
        query?: GetSubTopicsQueryDto,
        page?: HeaderPaginationParams,
      ): void {
        const isLoadAll: boolean =
          (!query || Object.keys(query).length === 0) &&
          (!page || Object.keys(page).length === 0);

        if (isLoadAll) {
          if (store.subTopicsLoaded() || store.subTopicsLoading()) {
            return;
          }
          patchState(store, {
            subTopicsLoading: true,
            subTopicsError: null,
          });
        }

        const items$: Observable<SubTopicResponseDto[]> = isLoadAll
          ? fetchAllPages(
              (
                allPage: HeaderPaginationParams,
              ): Observable<PaginateResult<SubTopicResponseDto>> =>
                subTopicsService.list({}, allPage),
            )
          : subTopicsService
              .list(query ?? {}, page ?? {})
              .pipe(
                map(
                  (
                    result: PaginateResult<SubTopicResponseDto>,
                  ): SubTopicResponseDto[] => result.docs,
                ),
              );

        items$.subscribe({
          next: (docs: SubTopicResponseDto[]): void => {
            if (isLoadAll) {
              patchState(store, {
                subTopics: docs,
                subTopicsLoaded: true,
                subTopicsLoading: false,
              });
            } else {
              const existingIds: Set<string> = new Set(
                store.subTopics().map((item: SubTopicResponseDto) => item._id),
              );
              const newItems: SubTopicResponseDto[] = docs.filter(
                (item: SubTopicResponseDto) => !existingIds.has(item._id),
              );
              patchState(store, {
                subTopics: [...store.subTopics(), ...newItems],
              });
            }
          },
          error: (error: unknown): void => {
            if (isLoadAll) {
              patchState(store, {
                subTopicsLoading: false,
                subTopicsError: toErrorMessage(error),
              });
            }
          },
        });
      },

      createSubTopic(
        dto: CreateSubTopicDto,
        callbacks: {
          next: (subTopic: SubTopicResponseDto) => void;
          error: (message: string) => void;
        },
      ): void {
        subTopicsService.create(dto).subscribe({
          next: (created: SubTopicResponseDto): void => {
            patchState(store, {
              subTopics: [...store.subTopics(), created],
            });
            callbacks.next(created);
          },
          error: (error: unknown): void => {
            callbacks.error(toErrorMessage(error));
          },
        });
      },

      updateSubTopic(
        id: string,
        dto: UpdateSubTopicDto,
        callbacks: {
          next: (subTopic: SubTopicResponseDto) => void;
          error: (message: string) => void;
        },
      ): void {
        subTopicsService.update(id, dto).subscribe({
          next: (updated: SubTopicResponseDto): void => {
            patchState(store, {
              subTopics: store
                .subTopics()
                .map((subTopic: SubTopicResponseDto) =>
                  subTopic._id === id ? updated : subTopic,
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
