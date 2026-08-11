import { ArticleStatus } from '../../enums';

export interface GetArticlesQueryDto {
  _id?: string;
  title?: string;
  subtitle?: string;
  status?: ArticleStatus;
  version?: number;
  publishedVersion?: number;
  createdAtStart?: string;
  createdAtEnd?: string;
  publishedAtStart?: string;
  publishedAtEnd?: string;
  minViewCount?: number;
  maxViewCount?: number;
  minReadingTime?: number;
  maxReadingTime?: number;
  authorId?: string;
}
