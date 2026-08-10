import { ArticleContentBlockType } from '../enums';

export interface ArticleContentBlockDto {
  type: ArticleContentBlockType;
  content: string;
  order: number;
  metadata?: Record<string, unknown>;
}
