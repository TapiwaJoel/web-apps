import { QuestionType, QuestionStatus } from '../enums';

/**
 * ListQuestionsQueryDto
 *
 * Unified data transfer object for filtering and paginating service-agnostic questions.
 * Supports filtering by article, type, status, tags, and author.
 */
export interface ListQuestionsQueryDto {
  id?: string;
  ids?: string[];
  articleId?: string;
  questionType?: QuestionType;
  status?: QuestionStatus;
  tags?: string[];
  authorId?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt';
  sortOrder?: 'asc' | 'desc';
}
