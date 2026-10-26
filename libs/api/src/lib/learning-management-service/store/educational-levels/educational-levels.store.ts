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
  CreateEducationalLevelDto,
  GetEducationalLevelsQueryDto,
  UpdateEducationalLevelDto,
  EducationalLevelResponseDto,
} from '../../dtos';
import { EducationalLevelsService } from '../../services';
import { Observable, map } from 'rxjs';
import {
  fetchAllPages,
  HeaderPaginationParams,
  PaginateResult,
} from '../../../common';
import { EducationalLevelsState } from './educational-levels.state.type';

const initialState: EducationalLevelsState = {
  educationalLevels: [],
  educationalLevelsLoaded: false,
  educationalLevelsLoading: false,
  educationalLevelsError: null,
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
 * Shared educational-levels state for the learning-management admin.
 *
 * Loaded once and kept in this root singleton so navigating away from and
 * back to the Educational Levels page reads already-fetched state instead of
 * refetching.
 */
export const EducationalLevelsStore: Type<
  {
    educationalLevels: Signal<EducationalLevelResponseDto[]>;
    educationalLevelsLoaded: Signal<boolean>;
    educationalLevelsLoading: Signal<boolean>;
    educationalLevelsError: Signal<string | null>;
    loadEducationalLevels: (
      query?: GetEducationalLevelsQueryDto,
      page?: HeaderPaginationParams,
    ) => void;
    createEducationalLevel: (
      dto: CreateEducationalLevelDto,
      callbacks: {
        next: (educationalLevel: EducationalLevelResponseDto) => void;
        error: (message: string) => void;
      },
    ) => void;
    updateEducationalLevel: (
      id: string,
      dto: UpdateEducationalLevelDto,
      callbacks: {
        next: (educationalLevel: EducationalLevelResponseDto) => void;
        error: (message: string) => void;
      },
    ) => void;
  } & StateSource<EducationalLevelsState>
> = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (
      store: StateSignals<EducationalLevelsState> &
        WritableStateSource<EducationalLevelsState>,
      educationalLevelsService: EducationalLevelsService = inject(
        EducationalLevelsService,
      ),
    ): {
      loadEducationalLevels: (
        query?: GetEducationalLevelsQueryDto,
        page?: HeaderPaginationParams,
      ) => void;
      createEducationalLevel: (
        dto: CreateEducationalLevelDto,
        callbacks: {
          next: (educationalLevel: EducationalLevelResponseDto) => void;
          error: (message: string) => void;
        },
      ) => void;
      updateEducationalLevel: (
        id: string,
        dto: UpdateEducationalLevelDto,
        callbacks: {
          next: (educationalLevel: EducationalLevelResponseDto) => void;
          error: (message: string) => void;
        },
      ) => void;
    } => ({
      loadEducationalLevels(
        query?: GetEducationalLevelsQueryDto,
        page?: HeaderPaginationParams,
      ): void {
        const isLoadAll: boolean =
          (!query || Object.keys(query).length === 0) &&
          (!page || Object.keys(page).length === 0);

        if (isLoadAll) {
          if (
            store.educationalLevelsLoaded() ||
            store.educationalLevelsLoading()
          ) {
            return;
          }
          patchState(store, {
            educationalLevelsLoading: true,
            educationalLevelsError: null,
          });
        }

        const items$: Observable<EducationalLevelResponseDto[]> = isLoadAll
          ? fetchAllPages(
              (
                allPage: HeaderPaginationParams,
              ): Observable<PaginateResult<EducationalLevelResponseDto>> =>
                educationalLevelsService.list({}, allPage),
            )
          : educationalLevelsService
              .list(query ?? {}, page ?? {})
              .pipe(
                map(
                  (
                    result: PaginateResult<EducationalLevelResponseDto>,
                  ): EducationalLevelResponseDto[] => result.docs,
                ),
              );

        items$.subscribe({
          next: (docs: EducationalLevelResponseDto[]): void => {
            if (isLoadAll) {
              patchState(store, {
                educationalLevels: docs,
                educationalLevelsLoaded: true,
                educationalLevelsLoading: false,
              });
            } else {
              const existingIds: Set<string> = new Set(
                store
                  .educationalLevels()
                  .map((item: EducationalLevelResponseDto) => item._id),
              );
              const newItems: EducationalLevelResponseDto[] = docs.filter(
                (item: EducationalLevelResponseDto) =>
                  !existingIds.has(item._id),
              );
              patchState(store, {
                educationalLevels: [...store.educationalLevels(), ...newItems],
              });
            }
          },
          error: (error: unknown): void => {
            if (isLoadAll) {
              patchState(store, {
                educationalLevelsLoading: false,
                educationalLevelsError: toErrorMessage(error),
              });
            }
          },
        });
      },

      createEducationalLevel(
        dto: CreateEducationalLevelDto,
        callbacks: {
          next: (educationalLevel: EducationalLevelResponseDto) => void;
          error: (message: string) => void;
        },
      ): void {
        educationalLevelsService.create(dto).subscribe({
          next: (created: EducationalLevelResponseDto): void => {
            patchState(store, {
              educationalLevels: [...store.educationalLevels(), created],
            });
            callbacks.next(created);
          },
          error: (error: unknown): void => {
            callbacks.error(toErrorMessage(error));
          },
        });
      },

      updateEducationalLevel(
        id: string,
        dto: UpdateEducationalLevelDto,
        callbacks: {
          next: (educationalLevel: EducationalLevelResponseDto) => void;
          error: (message: string) => void;
        },
      ): void {
        educationalLevelsService.update(id, dto).subscribe({
          next: (updated: EducationalLevelResponseDto): void => {
            patchState(store, {
              educationalLevels: store
                .educationalLevels()
                .map((educationalLevel: EducationalLevelResponseDto) =>
                  educationalLevel._id === id ? updated : educationalLevel,
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
