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
  AddReactionDto,
  GetReactionsQueryDto,
  ReactionResponseDto,
  ReactionTypeMetadataDto,
  RemoveReactionDto,
} from '../../dtos';
import { ReactionsService } from '../../services';
import { ReactionsState } from './reactions.state.type';

const initialState: ReactionsState = {
  reactions: [],
  reactionTypes: [],
  reactionTypesLoaded: false,
  reactionsLoading: false,
  reactionsError: null,
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
 * Shared reactions state.
 *
 * `reactions` holds the result of the most recent `loadReactions(query)`
 * call (each call replaces it — reactions are always scoped by a query, so
 * there is no load-once guard). `reactionTypes` is static metadata, loaded
 * once and kept in this root singleton.
 *
 * The backend keeps at most one reaction per user per entity
 * (`reactionable` + `reactionableId`). A non-null `addOrToggleReaction`
 * result replaces the caller's previous reaction on that entity. When a
 * reaction is toggled off (`null` result) or removed, the responses don't
 * identify whose reaction was dropped, so the store re-runs the last
 * `loadReactions` query to resync instead of guessing.
 */
export const ReactionsStore: Type<
  {
    reactions: Signal<ReactionResponseDto[]>;
    reactionTypes: Signal<ReactionTypeMetadataDto[]>;
    reactionTypesLoaded: Signal<boolean>;
    reactionsLoading: Signal<boolean>;
    reactionsError: Signal<string | null>;
    loadReactions: (query: GetReactionsQueryDto) => void;
    addOrToggleReaction: (
      dto: AddReactionDto,
      callbacks: {
        next: (reaction: ReactionResponseDto | null) => void;
        error: (message: string) => void;
      },
    ) => void;
    removeReaction: (
      dto: RemoveReactionDto,
      callbacks: { next: () => void; error: (message: string) => void },
    ) => void;
    loadReactionTypes: () => void;
  } & StateSource<ReactionsState>
> = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (
      store: StateSignals<ReactionsState> & WritableStateSource<ReactionsState>,
      reactionsService: ReactionsService = inject(ReactionsService),
    ): {
      loadReactions: (query: GetReactionsQueryDto) => void;
      addOrToggleReaction: (
        dto: AddReactionDto,
        callbacks: {
          next: (reaction: ReactionResponseDto | null) => void;
          error: (message: string) => void;
        },
      ) => void;
      removeReaction: (
        dto: RemoveReactionDto,
        callbacks: { next: () => void; error: (message: string) => void },
      ) => void;
      loadReactionTypes: () => void;
    } => {
      /** The query behind the current `reactions` list; null until first load. */
      let lastQuery: GetReactionsQueryDto | null = null;

      function fetchReactions(query: GetReactionsQueryDto): void {
        lastQuery = query;
        patchState(store, { reactionsLoading: true, reactionsError: null });

        reactionsService.list(query).subscribe({
          next: (reactions: ReactionResponseDto[]): void => {
            patchState(store, { reactions, reactionsLoading: false });
          },
          error: (error: unknown): void => {
            patchState(store, {
              reactionsLoading: false,
              reactionsError: toErrorMessage(error),
            });
          },
        });
      }

      /** Re-runs the last query, if any, after a reaction was dropped. */
      function resyncReactions(): void {
        if (lastQuery !== null) {
          fetchReactions(lastQuery);
        }
      }

      return {
        loadReactions(query: GetReactionsQueryDto): void {
          fetchReactions(query);
        },

        addOrToggleReaction(
          dto: AddReactionDto,
          callbacks: {
            next: (reaction: ReactionResponseDto | null) => void;
            error: (message: string) => void;
          },
        ): void {
          reactionsService.addOrToggle(dto).subscribe({
            next: (reaction: ReactionResponseDto | null): void => {
              if (reaction === null) {
                resyncReactions();
              } else {
                patchState(store, {
                  reactions: [
                    ...store
                      .reactions()
                      .filter(
                        (item: ReactionResponseDto) =>
                          item.id !== reaction.id &&
                          !(
                            item.userId === reaction.userId &&
                            item.reactionable === reaction.reactionable &&
                            item.reactionableId === reaction.reactionableId
                          ),
                      ),
                    reaction,
                  ],
                });
              }
              callbacks.next(reaction);
            },
            error: (error: unknown): void => {
              callbacks.error(toErrorMessage(error));
            },
          });
        },

        removeReaction(
          dto: RemoveReactionDto,
          callbacks: { next: () => void; error: (message: string) => void },
        ): void {
          reactionsService.remove(dto).subscribe({
            next: (): void => {
              resyncReactions();
              callbacks.next();
            },
            error: (error: unknown): void => {
              callbacks.error(toErrorMessage(error));
            },
          });
        },

        loadReactionTypes(): void {
          if (store.reactionTypesLoaded()) {
            return;
          }

          reactionsService.types().subscribe({
            next: (reactionTypes: ReactionTypeMetadataDto[]): void => {
              patchState(store, { reactionTypes, reactionTypesLoaded: true });
            },
            error: (error: unknown): void => {
              patchState(store, { reactionsError: toErrorMessage(error) });
            },
          });
        },
      };
    },
  ),
);
