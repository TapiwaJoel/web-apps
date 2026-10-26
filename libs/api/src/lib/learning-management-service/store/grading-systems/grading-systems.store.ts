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
  CreateGradingSystemDto,
  GetGradingSystemsQueryDto,
  GradingSystemResponseDto,
  UpdateGradingSystemDto,
} from '../../dtos';
import { GradingSystemsService } from '../../services';
import { Observable, map } from 'rxjs';
import {
  fetchAllPages,
  HeaderPaginationParams,
  PaginateResult,
} from '../../../common';
import { GradingSystemsState } from './grading-systems.state.type';

const initialState: GradingSystemsState = {
  gradingSystems: [],
  gradingSystemsLoaded: false,
  gradingSystemsLoading: false,
  gradingSystemsError: null,
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
 * Shared grading-systems state for the learning-management admin.
 *
 * Loaded once and kept in this root singleton so navigating away from and
 * back to the Grading Systems page reads already-fetched state instead of
 * refetching.
 */
export const GradingSystemsStore: Type<
  {
    gradingSystems: Signal<GradingSystemResponseDto[]>;
    gradingSystemsLoaded: Signal<boolean>;
    gradingSystemsLoading: Signal<boolean>;
    gradingSystemsError: Signal<string | null>;
    loadGradingSystems: (
      query?: GetGradingSystemsQueryDto,
      page?: HeaderPaginationParams,
    ) => void;
    createGradingSystem: (
      dto: CreateGradingSystemDto,
      callbacks: {
        next: (gradingSystem: GradingSystemResponseDto) => void;
        error: (message: string) => void;
      },
    ) => void;
    updateGradingSystem: (
      id: string,
      dto: UpdateGradingSystemDto,
      callbacks: {
        next: (gradingSystem: GradingSystemResponseDto) => void;
        error: (message: string) => void;
      },
    ) => void;
  } & StateSource<GradingSystemsState>
> = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (
      store: StateSignals<GradingSystemsState> &
        WritableStateSource<GradingSystemsState>,
      gradingSystemsService: GradingSystemsService = inject(
        GradingSystemsService,
      ),
    ): {
      loadGradingSystems: (
        query?: GetGradingSystemsQueryDto,
        page?: HeaderPaginationParams,
      ) => void;
      createGradingSystem: (
        dto: CreateGradingSystemDto,
        callbacks: {
          next: (gradingSystem: GradingSystemResponseDto) => void;
          error: (message: string) => void;
        },
      ) => void;
      updateGradingSystem: (
        id: string,
        dto: UpdateGradingSystemDto,
        callbacks: {
          next: (gradingSystem: GradingSystemResponseDto) => void;
          error: (message: string) => void;
        },
      ) => void;
    } => ({
      loadGradingSystems(
        query?: GetGradingSystemsQueryDto,
        page?: HeaderPaginationParams,
      ): void {
        const isLoadAll: boolean =
          (!query || Object.keys(query).length === 0) &&
          (!page || Object.keys(page).length === 0);

        if (isLoadAll) {
          if (store.gradingSystemsLoaded() || store.gradingSystemsLoading()) {
            return;
          }
          patchState(store, {
            gradingSystemsLoading: true,
            gradingSystemsError: null,
          });
        }

        const items$: Observable<GradingSystemResponseDto[]> = isLoadAll
          ? fetchAllPages(
              (
                allPage: HeaderPaginationParams,
              ): Observable<PaginateResult<GradingSystemResponseDto>> =>
                gradingSystemsService.list({}, allPage),
            )
          : gradingSystemsService
              .list(query ?? {}, page ?? {})
              .pipe(
                map(
                  (
                    result: PaginateResult<GradingSystemResponseDto>,
                  ): GradingSystemResponseDto[] => result.docs,
                ),
              );

        items$.subscribe({
          next: (docs: GradingSystemResponseDto[]): void => {
            if (isLoadAll) {
              patchState(store, {
                gradingSystems: docs,
                gradingSystemsLoaded: true,
                gradingSystemsLoading: false,
              });
            } else {
              const existingIds: Set<string> = new Set(
                store
                  .gradingSystems()
                  .map((item: GradingSystemResponseDto) => item._id),
              );
              const newItems: GradingSystemResponseDto[] = docs.filter(
                (item: GradingSystemResponseDto) => !existingIds.has(item._id),
              );
              patchState(store, {
                gradingSystems: [...store.gradingSystems(), ...newItems],
              });
            }
          },
          error: (error: unknown): void => {
            if (isLoadAll) {
              patchState(store, {
                gradingSystemsLoading: false,
                gradingSystemsError: toErrorMessage(error),
              });
            }
          },
        });
      },

      createGradingSystem(
        dto: CreateGradingSystemDto,
        callbacks: {
          next: (gradingSystem: GradingSystemResponseDto) => void;
          error: (message: string) => void;
        },
      ): void {
        gradingSystemsService.create(dto).subscribe({
          next: (created: GradingSystemResponseDto): void => {
            patchState(store, {
              gradingSystems: [...store.gradingSystems(), created],
            });
            callbacks.next(created);
          },
          error: (error: unknown): void => {
            callbacks.error(toErrorMessage(error));
          },
        });
      },

      updateGradingSystem(
        id: string,
        dto: UpdateGradingSystemDto,
        callbacks: {
          next: (gradingSystem: GradingSystemResponseDto) => void;
          error: (message: string) => void;
        },
      ): void {
        gradingSystemsService.update(id, dto).subscribe({
          next: (updated: GradingSystemResponseDto): void => {
            patchState(store, {
              gradingSystems: store
                .gradingSystems()
                .map((gradingSystem: GradingSystemResponseDto) =>
                  gradingSystem._id === id ? updated : gradingSystem,
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
