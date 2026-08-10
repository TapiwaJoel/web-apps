import { ReactionType } from '../enums';

/**
 * ReactionResponseDto
 *
 * Data transfer object for returning reaction data to clients.
 * Used in HTTP responses and WebSocket events.
 */
export interface ReactionResponseDto {
  id: string;
  reactionable: string;
  reactionableId: string;
  userId: string;
  reactionType: ReactionType;
  createdAt: string;
  updatedAt: string;
}
