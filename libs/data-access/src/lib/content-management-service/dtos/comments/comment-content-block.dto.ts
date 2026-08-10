import { CommentContentType } from '../../enums';

/**
 * CommentContentBlockDto
 *
 * Represents a single content block within a comment.
 * Supports multiple content types (text, image, video).
 * For IMAGE/VIDEO types, the content field contains a resourceId reference.
 */
export interface CommentContentBlockDto {
  type: CommentContentType;
  content: string;
}
