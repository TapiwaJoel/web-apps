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
  CreateProfileDto,
  GetProfilesQueryDto,
  ProfileResponseDto,
  UpdateProfileDto,
} from '../../dtos';
import { ProfilesService } from '../../services';
import { Observable, map } from 'rxjs';
import {
  fetchAllPages,
  HeaderPaginationParams,
  PaginateResult,
} from '../../../common';
import { ProfilesState } from './profiles.state.type';

const initialState: ProfilesState = {
  profiles: [],
  profilesLoaded: false,
  profilesLoading: false,
  profilesError: null,
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
 * Shared profiles state for the learning-management admin.
 *
 * Loaded once and kept in this root singleton so navigating away from and
 * back to the Profiles page reads already-fetched state instead of
 * refetching.
 */
export const ProfilesStore: Type<
  {
    profiles: Signal<ProfileResponseDto[]>;
    profilesLoaded: Signal<boolean>;
    profilesLoading: Signal<boolean>;
    profilesError: Signal<string | null>;
    loadProfiles: (
      query?: GetProfilesQueryDto,
      page?: HeaderPaginationParams,
    ) => void;
    createProfile: (
      dto: CreateProfileDto,
      callbacks: {
        next: (profile: ProfileResponseDto) => void;
        error: (message: string) => void;
      },
    ) => void;
    updateProfile: (
      id: string,
      dto: UpdateProfileDto,
      callbacks: {
        next: (profile: ProfileResponseDto) => void;
        error: (message: string) => void;
      },
    ) => void;
  } & StateSource<ProfilesState>
> = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (
      store: StateSignals<ProfilesState> & WritableStateSource<ProfilesState>,
      profilesService: ProfilesService = inject(ProfilesService),
    ): {
      loadProfiles: (
        query?: GetProfilesQueryDto,
        page?: HeaderPaginationParams,
      ) => void;
      createProfile: (
        dto: CreateProfileDto,
        callbacks: {
          next: (profile: ProfileResponseDto) => void;
          error: (message: string) => void;
        },
      ) => void;
      updateProfile: (
        id: string,
        dto: UpdateProfileDto,
        callbacks: {
          next: (profile: ProfileResponseDto) => void;
          error: (message: string) => void;
        },
      ) => void;
    } => ({
      loadProfiles(
        query?: GetProfilesQueryDto,
        page?: HeaderPaginationParams,
      ): void {
        const isLoadAll: boolean =
          (!query || Object.keys(query).length === 0) &&
          (!page || Object.keys(page).length === 0);

        if (isLoadAll) {
          if (store.profilesLoaded() || store.profilesLoading()) {
            return;
          }
          patchState(store, {
            profilesLoading: true,
            profilesError: null,
          });
        }

        const items$: Observable<ProfileResponseDto[]> = isLoadAll
          ? fetchAllPages(
              (
                allPage: HeaderPaginationParams,
              ): Observable<PaginateResult<ProfileResponseDto>> =>
                profilesService.list({}, allPage),
            )
          : profilesService
              .list(query ?? {}, page ?? {})
              .pipe(
                map(
                  (
                    result: PaginateResult<ProfileResponseDto>,
                  ): ProfileResponseDto[] => result.docs,
                ),
              );

        items$.subscribe({
          next: (docs: ProfileResponseDto[]): void => {
            if (isLoadAll) {
              patchState(store, {
                profiles: docs,
                profilesLoaded: true,
                profilesLoading: false,
              });
            } else {
              const existingIds: Set<string> = new Set(
                store.profiles().map((item: ProfileResponseDto) => item._id),
              );
              const newItems: ProfileResponseDto[] = docs.filter(
                (item: ProfileResponseDto) => !existingIds.has(item._id),
              );
              patchState(store, {
                profiles: [...store.profiles(), ...newItems],
              });
            }
          },
          error: (error: unknown): void => {
            if (isLoadAll) {
              patchState(store, {
                profilesLoading: false,
                profilesError: toErrorMessage(error),
              });
            }
          },
        });
      },

      createProfile(
        dto: CreateProfileDto,
        callbacks: {
          next: (profile: ProfileResponseDto) => void;
          error: (message: string) => void;
        },
      ): void {
        profilesService.create(dto).subscribe({
          next: (created: ProfileResponseDto): void => {
            patchState(store, {
              profiles: [...store.profiles(), created],
            });
            callbacks.next(created);
          },
          error: (error: unknown): void => {
            callbacks.error(toErrorMessage(error));
          },
        });
      },

      updateProfile(
        id: string,
        dto: UpdateProfileDto,
        callbacks: {
          next: (profile: ProfileResponseDto) => void;
          error: (message: string) => void;
        },
      ): void {
        profilesService.update(id, dto).subscribe({
          next: (updated: ProfileResponseDto): void => {
            patchState(store, {
              profiles: store
                .profiles()
                .map((profile: ProfileResponseDto) =>
                  profile._id === id ? updated : profile,
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
