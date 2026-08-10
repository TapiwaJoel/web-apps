import { CommentStatus } from '../../enums';

/**
 * CommentSortOrder
 *
 * Enum defining the possible sort order values for comments.
 */
export enum CommentSortOrder {
  NEWEST = 'newest',
  OLDEST = 'oldest',
}

export interface GetCommentsQueryDto {
  commentable: string;
  commentableId: string;
  _id?: string;
  authorId?: string;
  parentId?: string;
  level?: number;
  status?: CommentStatus;
  isPinned?: boolean;
  isFlagged?: boolean;
  createdAtFrom?: string;
  createdAtTo?: string;
  editedAtFrom?: string;
  editedAtTo?: string;
  sort?: CommentSortOrder;
}
