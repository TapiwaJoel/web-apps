import { ReactionType } from '../enums';

/**
 * GetReactionsQueryDto
 *
 * Data transfer object for querying reactions with optional filters.
 * Supports filtering by entity type, entity ID, user ID, and reaction type.
 */
export interface GetReactionsQueryDto {
  reactionable?: string;
  reactionableId?: string;
  userId?: string;
  reactionType?: ReactionType;
}
