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
  CreateStreamDto,
  GetStreamsQueryDto,
  StreamResponseDto,
  UpdateStreamDto,
} from '../../dtos';
import { LiveStreamsService } from '../../services';
import { Observable, map } from 'rxjs';
import {
  fetchAllPages,
  HeaderPaginationParams,
  PaginateResult,
} from '../../../common';
import { LiveStreamsState } from './live-streams.state.type';

const initialState: LiveStreamsState = {
  liveStreams: [],
  liveStreamsLoaded: false,
  liveStreamsLoading: false,
  liveStreamsError: null,
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
 * Shared live-streams state for admin apps.
 *
 * Loaded once and kept in this root singleton so navigating away from and
 * back to the Live Streams page reads already-fetched state instead of
 * refetching.
 */
export const LiveStreamsStore: Type<
  {
    liveStreams: Signal<StreamResponseDto[]>;
    liveStreamsLoaded: Signal<boolean>;
    liveStreamsLoading: Signal<boolean>;
    liveStreamsError: Signal<string | null>;
    loadLiveStreams: (
      query?: GetStreamsQueryDto,
      page?: HeaderPaginationParams,
    ) => void;
    createLiveStream: (
      dto: CreateStreamDto,
      callbacks: {
        next: (liveStream: StreamResponseDto) => void;
        error: (message: string) => void;
      },
    ) => void;
    updateLiveStream: (
      id: string,
      dto: UpdateStreamDto,
      callbacks: {
        next: (liveStream: StreamResponseDto) => void;
        error: (message: string) => void;
      },
    ) => void;
  } & StateSource<LiveStreamsState>
> = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (
      store: StateSignals<LiveStreamsState> &
        WritableStateSource<LiveStreamsState>,
      liveStreamsService: LiveStreamsService = inject(LiveStreamsService),
    ): {
      loadLiveStreams: (
        query?: GetStreamsQueryDto,
        page?: HeaderPaginationParams,
      ) => void;
      createLiveStream: (
        dto: CreateStreamDto,
        callbacks: {
          next: (liveStream: StreamResponseDto) => void;
          error: (message: string) => void;
        },
      ) => void;
      updateLiveStream: (
        id: string,
        dto: UpdateStreamDto,
        callbacks: {
          next: (liveStream: StreamResponseDto) => void;
          error: (message: string) => void;
        },
      ) => void;
    } => ({
      loadLiveStreams(
        query?: GetStreamsQueryDto,
        page?: HeaderPaginationParams,
      ): void {
        const isLoadAll: boolean =
          (!query || Object.keys(query).length === 0) &&
          (!page || Object.keys(page).length === 0);

        if (isLoadAll) {
          if (store.liveStreamsLoaded() || store.liveStreamsLoading()) {
            return;
          }
          patchState(store, {
            liveStreamsLoading: true,
            liveStreamsError: null,
          });
        }

        const items$: Observable<StreamResponseDto[]> = isLoadAll
          ? fetchAllPages(
              (
                allPage: HeaderPaginationParams,
              ): Observable<PaginateResult<StreamResponseDto>> =>
                liveStreamsService.list({}, allPage),
            )
          : liveStreamsService
              .list(query ?? {}, page ?? {})
              .pipe(
                map(
                  (
                    result: PaginateResult<StreamResponseDto>,
                  ): StreamResponseDto[] => result.docs,
                ),
              );

        items$.subscribe({
          next: (docs: StreamResponseDto[]): void => {
            if (isLoadAll) {
              patchState(store, {
                liveStreams: docs,
                liveStreamsLoaded: true,
                liveStreamsLoading: false,
              });
            } else {
              const existingIds: Set<string> = new Set(
                store.liveStreams().map((item: StreamResponseDto) => item._id),
              );
              const newItems: StreamResponseDto[] = docs.filter(
                (item: StreamResponseDto) => !existingIds.has(item._id),
              );
              patchState(store, {
                liveStreams: [...store.liveStreams(), ...newItems],
              });
            }
          },
          error: (error: unknown): void => {
            if (isLoadAll) {
              patchState(store, {
                liveStreamsLoading: false,
                liveStreamsError: toErrorMessage(error),
              });
            }
          },
        });
      },

      createLiveStream(
        dto: CreateStreamDto,
        callbacks: {
          next: (liveStream: StreamResponseDto) => void;
          error: (message: string) => void;
        },
      ): void {
        liveStreamsService.create(dto).subscribe({
          next: (created: StreamResponseDto): void => {
            patchState(store, {
              liveStreams: [...store.liveStreams(), created],
            });
            callbacks.next(created);
          },
          error: (error: unknown): void => {
            callbacks.error(toErrorMessage(error));
          },
        });
      },

      updateLiveStream(
        id: string,
        dto: UpdateStreamDto,
        callbacks: {
          next: (liveStream: StreamResponseDto) => void;
          error: (message: string) => void;
        },
      ): void {
        liveStreamsService.update(id, dto).subscribe({
          next: (updated: StreamResponseDto): void => {
            patchState(store, {
              liveStreams: store
                .liveStreams()
                .map((liveStream: StreamResponseDto) =>
                  liveStream._id === id ? updated : liveStream,
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
