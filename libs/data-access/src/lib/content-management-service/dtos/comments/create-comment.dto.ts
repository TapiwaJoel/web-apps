import { CommentContentBlockDto } from './comment-content-block.dto';

export interface CreateCommentDto {
  commentable: string;
  commentableId: string;
  content: CommentContentBlockDto;
  parentId?: string;
}
