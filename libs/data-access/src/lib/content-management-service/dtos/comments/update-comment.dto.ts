import { CommentContentBlockDto } from './comment-content-block.dto';
import { CommentStatus } from '../enums';

export interface UpdateCommentDto {
  content?: CommentContentBlockDto;
  status?: CommentStatus;
  isPinned?: boolean;
  isFlagged?: boolean;
  flagReason?: string;
}
