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
import { AnyResourceResponseDto, GetResourcesQueryDto } from '../../dtos';
import { FileType } from '../../enums';
import { ResourcesService } from '../../services';
import { Observable, map } from 'rxjs';
import {
  fetchAllPages,
  HeaderPaginationParams,
  PaginateResult,
} from '../../../common';
import { ResourcesState } from './resources.state.type';

const initialState: ResourcesState = {
  resources: [],
  resourcesLoaded: false,
  resourcesLoading: false,
  resourcesError: null,
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
 * Shared resources (uploaded media and documents) state.
 *
 * Loaded once and kept in this root singleton so navigating away from and
 * back to a page that lists resources reads already-fetched state instead of
 * refetching. Fetching a resource's content stays on `ResourcesService`
 * (`getContent` / `contentUrl`).
 */
export const ResourcesStore: Type<
  {
    resources: Signal<AnyResourceResponseDto[]>;
    resourcesLoaded: Signal<boolean>;
    resourcesLoading: Signal<boolean>;
    resourcesError: Signal<string | null>;
    loadResources: (
      query?: GetResourcesQueryDto,
      page?: HeaderPaginationParams,
    ) => void;
    uploadResources: (
      files: File[],
      callbacks: {
        next: (uploaded: AnyResourceResponseDto[]) => void;
        error: (message: string) => void;
      },
    ) => void;
    removeResource: (
      type: FileType,
      filename: string,
      callbacks: {
        next: () => void;
        error: (message: string) => void;
      },
    ) => void;
  } & StateSource<ResourcesState>
> = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (
      store: StateSignals<ResourcesState> & WritableStateSource<ResourcesState>,
      resourcesService: ResourcesService = inject(ResourcesService),
    ): {
      loadResources: (
        query?: GetResourcesQueryDto,
        page?: HeaderPaginationParams,
      ) => void;
      uploadResources: (
        files: File[],
        callbacks: {
          next: (uploaded: AnyResourceResponseDto[]) => void;
          error: (message: string) => void;
        },
      ) => void;
      removeResource: (
        type: FileType,
        filename: string,
        callbacks: {
          next: () => void;
          error: (message: string) => void;
        },
      ) => void;
    } => ({
      loadResources(
        query?: GetResourcesQueryDto,
        page?: HeaderPaginationParams,
      ): void {
        const isLoadAll: boolean =
          (!query || Object.keys(query).length === 0) &&
          (!page || Object.keys(page).length === 0);

        if (isLoadAll) {
          if (store.resourcesLoaded() || store.resourcesLoading()) {
            return;
          }
          patchState(store, {
            resourcesLoading: true,
            resourcesError: null,
          });
        }

        const items$: Observable<AnyResourceResponseDto[]> = isLoadAll
          ? fetchAllPages(
              (
                allPage: HeaderPaginationParams,
              ): Observable<PaginateResult<AnyResourceResponseDto>> =>
                resourcesService.list({}, allPage),
            )
          : resourcesService
              .list(query ?? {}, page ?? {})
              .pipe(
                map(
                  (
                    result: PaginateResult<AnyResourceResponseDto>,
                  ): AnyResourceResponseDto[] => result.docs,
                ),
              );

        items$.subscribe({
          next: (docs: AnyResourceResponseDto[]): void => {
            if (isLoadAll) {
              patchState(store, {
                resources: docs,
                resourcesLoaded: true,
                resourcesLoading: false,
              });
            } else {
              const existingIds: Set<string> = new Set(
                store
                  .resources()
                  .map((item: AnyResourceResponseDto) => item._id),
              );
              const newItems: AnyResourceResponseDto[] = docs.filter(
                (item: AnyResourceResponseDto) => !existingIds.has(item._id),
              );
              patchState(store, {
                resources: [...store.resources(), ...newItems],
              });
            }
          },
          error: (error: unknown): void => {
            if (isLoadAll) {
              patchState(store, {
                resourcesLoading: false,
                resourcesError: toErrorMessage(error),
              });
            }
          },
        });
      },

      uploadResources(
        files: File[],
        callbacks: {
          next: (uploaded: AnyResourceResponseDto[]) => void;
          error: (message: string) => void;
        },
      ): void {
        resourcesService.upload(files).subscribe({
          next: (uploaded: AnyResourceResponseDto[]): void => {
            patchState(store, {
              resources: [...uploaded, ...store.resources()],
            });
            callbacks.next(uploaded);
          },
          error: (error: unknown): void => {
            callbacks.error(toErrorMessage(error));
          },
        });
      },

      removeResource(
        type: FileType,
        filename: string,
        callbacks: {
          next: () => void;
          error: (message: string) => void;
        },
      ): void {
        resourcesService.remove(type, filename).subscribe({
          next: (): void => {
            patchState(store, {
              resources: store
                .resources()
                .filter(
                  (resource: AnyResourceResponseDto) =>
                    !(resource.type === type && resource.name === filename),
                ),
            });
            callbacks.next();
          },
          error: (error: unknown): void => {
            callbacks.error(toErrorMessage(error));
          },
        });
      },
    }),
  ),
);
