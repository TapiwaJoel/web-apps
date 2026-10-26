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
  CreateArticleDto,
  GetArticlesQueryDto,
  ArticleResponseDto,
  UpdateArticleDto,
} from '../../dtos';
import { ArticlesService } from '../../services';
import { Observable, map } from 'rxjs';
import {
  fetchAllPages,
  HeaderPaginationParams,
  PaginateResult,
} from '../../../common';
import { ArticlesState } from './articles.state.type';

const initialState: ArticlesState = {
  articles: [],
  articlesLoaded: false,
  articlesLoading: false,
  articlesError: null,
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
 * Shared articles state for admin apps.
 *
 * Loaded once and kept in this root singleton so navigating away from and
 * back to the Articles page reads already-fetched state instead of
 * refetching.
 */
export const ArticlesStore: Type<
  {
    articles: Signal<ArticleResponseDto[]>;
    articlesLoaded: Signal<boolean>;
    articlesLoading: Signal<boolean>;
    articlesError: Signal<string | null>;
    loadArticles: (
      query?: GetArticlesQueryDto,
      page?: HeaderPaginationParams,
    ) => void;
    createArticle: (
      dto: CreateArticleDto,
      callbacks: {
        next: (article: ArticleResponseDto) => void;
        error: (message: string) => void;
      },
    ) => void;
    updateArticle: (
      id: string,
      dto: UpdateArticleDto,
      callbacks: {
        next: (article: ArticleResponseDto) => void;
        error: (message: string) => void;
      },
    ) => void;
  } & StateSource<ArticlesState>
> = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (
      store: StateSignals<ArticlesState> & WritableStateSource<ArticlesState>,
      articlesService: ArticlesService = inject(ArticlesService),
    ): {
      loadArticles: (
        query?: GetArticlesQueryDto,
        page?: HeaderPaginationParams,
      ) => void;
      createArticle: (
        dto: CreateArticleDto,
        callbacks: {
          next: (article: ArticleResponseDto) => void;
          error: (message: string) => void;
        },
      ) => void;
      updateArticle: (
        id: string,
        dto: UpdateArticleDto,
        callbacks: {
          next: (article: ArticleResponseDto) => void;
          error: (message: string) => void;
        },
      ) => void;
    } => ({
      loadArticles(
        query?: GetArticlesQueryDto,
        page?: HeaderPaginationParams,
      ): void {
        const isLoadAll: boolean =
          (!query || Object.keys(query).length === 0) &&
          (!page || Object.keys(page).length === 0);

        if (isLoadAll) {
          if (store.articlesLoaded() || store.articlesLoading()) {
            return;
          }
          patchState(store, { articlesLoading: true, articlesError: null });
        }

        const items$: Observable<ArticleResponseDto[]> = isLoadAll
          ? fetchAllPages(
              (
                allPage: HeaderPaginationParams,
              ): Observable<PaginateResult<ArticleResponseDto>> =>
                articlesService.list({}, allPage),
            )
          : articlesService
              .list(query ?? {}, page ?? {})
              .pipe(
                map(
                  (
                    result: PaginateResult<ArticleResponseDto>,
                  ): ArticleResponseDto[] => result.docs,
                ),
              );

        items$.subscribe({
          next: (docs: ArticleResponseDto[]): void => {
            if (isLoadAll) {
              patchState(store, {
                articles: docs,
                articlesLoaded: true,
                articlesLoading: false,
              });
            } else {
              const existingIds: Set<string> = new Set(
                store.articles().map((item: ArticleResponseDto) => item.id),
              );
              const newItems: ArticleResponseDto[] = docs.filter(
                (item: ArticleResponseDto) => !existingIds.has(item.id),
              );
              patchState(store, {
                articles: [...store.articles(), ...newItems],
              });
            }
          },
          error: (error: unknown): void => {
            if (isLoadAll) {
              patchState(store, {
                articlesLoading: false,
                articlesError: toErrorMessage(error),
              });
            }
          },
        });
      },

      createArticle(
        dto: CreateArticleDto,
        callbacks: {
          next: (article: ArticleResponseDto) => void;
          error: (message: string) => void;
        },
      ): void {
        articlesService.create(dto).subscribe({
          next: (created: ArticleResponseDto): void => {
            patchState(store, { articles: [...store.articles(), created] });
            callbacks.next(created);
          },
          error: (error: unknown): void => {
            callbacks.error(toErrorMessage(error));
          },
        });
      },

      updateArticle(
        id: string,
        dto: UpdateArticleDto,
        callbacks: {
          next: (article: ArticleResponseDto) => void;
          error: (message: string) => void;
        },
      ): void {
        articlesService.update(id, dto).subscribe({
          next: (updated: ArticleResponseDto): void => {
            patchState(store, {
              articles: store
                .articles()
                .map((article: ArticleResponseDto) =>
                  article.id === id ? updated : article,
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
