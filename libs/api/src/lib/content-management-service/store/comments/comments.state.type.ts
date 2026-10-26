import { CommentResponseDto } from '../../dtos';

export interface CommentsState {
  comments: CommentResponseDto[];
  commentsLoading: boolean;
  commentsError: string | null;
}
