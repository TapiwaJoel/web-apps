import { CommentContentBlockDto } from './comment-content-block.dto';

/**
 * CommentResponseDto
 *
 * Data transfer object for comment responses.
 * Used in the HTTP layer to return comment data to clients.
 * Includes author information and nested comment metadata.
 */
export interface CommentResponseDto {
  id: string;
  commentable: string;
  commentableId: string;
  content: CommentContentBlockDto;
  level: number;
  parentId?: string;
  status: string;
  isPinned: boolean;
  isFlagged: boolean;
  replyCount: number;
  authorId: string;
  createdAt: string;
  editedAt?: string;
  updatedAt: string;
}
