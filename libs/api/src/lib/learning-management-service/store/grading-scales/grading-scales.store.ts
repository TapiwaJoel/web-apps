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
  CreateGradingScaleDto,
  GetGradingScalesQueryDto,
  GradingScaleResponseDto,
  UpdateGradingScaleDto,
} from '../../dtos';
import { GradingScalesService } from '../../services';
import { Observable, map } from 'rxjs';
import {
  fetchAllPages,
  HeaderPaginationParams,
  PaginateResult,
} from '../../../common';
import { GradingScalesState } from './grading-scales.state.type';

const initialState: GradingScalesState = {
  gradingScales: [],
  gradingScalesLoaded: false,
  gradingScalesLoading: false,
  gradingScalesError: null,
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
 * Shared grading-scales state for the learning-management admin.
 *
 * Loaded once and kept in this root singleton so navigating away from and
 * back to the Grading Scales page reads already-fetched state instead of
 * refetching.
 */
export const GradingScalesStore: Type<
  {
    gradingScales: Signal<GradingScaleResponseDto[]>;
    gradingScalesLoaded: Signal<boolean>;
    gradingScalesLoading: Signal<boolean>;
    gradingScalesError: Signal<string | null>;
    loadGradingScales: (
      query?: GetGradingScalesQueryDto,
      page?: HeaderPaginationParams,
    ) => void;
    createGradingScale: (
      dto: CreateGradingScaleDto,
      callbacks: {
        next: (gradingScale: GradingScaleResponseDto) => void;
        error: (message: string) => void;
      },
    ) => void;
    updateGradingScale: (
      id: string,
      dto: UpdateGradingScaleDto,
      callbacks: {
        next: (gradingScale: GradingScaleResponseDto) => void;
        error: (message: string) => void;
      },
    ) => void;
  } & StateSource<GradingScalesState>
> = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (
      store: StateSignals<GradingScalesState> &
        WritableStateSource<GradingScalesState>,
      gradingScalesService: GradingScalesService = inject(GradingScalesService),
    ): {
      loadGradingScales: (
        query?: GetGradingScalesQueryDto,
        page?: HeaderPaginationParams,
      ) => void;
      createGradingScale: (
        dto: CreateGradingScaleDto,
        callbacks: {
          next: (gradingScale: GradingScaleResponseDto) => void;
          error: (message: string) => void;
        },
      ) => void;
      updateGradingScale: (
        id: string,
        dto: UpdateGradingScaleDto,
        callbacks: {
          next: (gradingScale: GradingScaleResponseDto) => void;
          error: (message: string) => void;
        },
      ) => void;
    } => ({
      loadGradingScales(
        query?: GetGradingScalesQueryDto,
        page?: HeaderPaginationParams,
      ): void {
        const isLoadAll: boolean =
          (!query || Object.keys(query).length === 0) &&
          (!page || Object.keys(page).length === 0);

        if (isLoadAll) {
          if (store.gradingScalesLoaded() || store.gradingScalesLoading()) {
            return;
          }
          patchState(store, {
            gradingScalesLoading: true,
            gradingScalesError: null,
          });
        }

        const items$: Observable<GradingScaleResponseDto[]> = isLoadAll
          ? fetchAllPages(
              (
                allPage: HeaderPaginationParams,
              ): Observable<PaginateResult<GradingScaleResponseDto>> =>
                gradingScalesService.list({}, allPage),
            )
          : gradingScalesService
              .list(query ?? {}, page ?? {})
              .pipe(
                map(
                  (
                    result: PaginateResult<GradingScaleResponseDto>,
                  ): GradingScaleResponseDto[] => result.docs,
                ),
              );

        items$.subscribe({
          next: (docs: GradingScaleResponseDto[]): void => {
            if (isLoadAll) {
              patchState(store, {
                gradingScales: docs,
                gradingScalesLoaded: true,
                gradingScalesLoading: false,
              });
            } else {
              const existingIds: Set<string> = new Set(
                store
                  .gradingScales()
                  .map((item: GradingScaleResponseDto) => item._id),
              );
              const newItems: GradingScaleResponseDto[] = docs.filter(
                (item: GradingScaleResponseDto) => !existingIds.has(item._id),
              );
              patchState(store, {
                gradingScales: [...store.gradingScales(), ...newItems],
              });
            }
          },
          error: (error: unknown): void => {
            if (isLoadAll) {
              patchState(store, {
                gradingScalesLoading: false,
                gradingScalesError: toErrorMessage(error),
              });
            }
          },
        });
      },

      createGradingScale(
        dto: CreateGradingScaleDto,
        callbacks: {
          next: (gradingScale: GradingScaleResponseDto) => void;
          error: (message: string) => void;
        },
      ): void {
        gradingScalesService.create(dto).subscribe({
          next: (created: GradingScaleResponseDto): void => {
            patchState(store, {
              gradingScales: [...store.gradingScales(), created],
            });
            callbacks.next(created);
          },
          error: (error: unknown): void => {
            callbacks.error(toErrorMessage(error));
          },
        });
      },

      updateGradingScale(
        id: string,
        dto: UpdateGradingScaleDto,
        callbacks: {
          next: (gradingScale: GradingScaleResponseDto) => void;
          error: (message: string) => void;
        },
      ): void {
        gradingScalesService.update(id, dto).subscribe({
          next: (updated: GradingScaleResponseDto): void => {
            patchState(store, {
              gradingScales: store
                .gradingScales()
                .map((gradingScale: GradingScaleResponseDto) =>
                  gradingScale._id === id ? updated : gradingScale,
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
