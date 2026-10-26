import { ArticleResponseDto } from '../../dtos';

export interface ArticlesState {
  articles: ArticleResponseDto[];
  articlesLoaded: boolean;
  articlesLoading: boolean;
  articlesError: string | null;
}
