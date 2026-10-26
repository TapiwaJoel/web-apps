import { CommentSortOrder, CommentStatus } from '../../enums';

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
