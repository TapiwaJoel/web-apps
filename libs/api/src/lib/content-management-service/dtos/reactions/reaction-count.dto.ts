import { ReactionType } from '../../enums';

/**
 * ReactionCountDto
 *
 * Represents the count for a specific reaction type.
 */
export interface ReactionCountDto {
  reactionType: ReactionType;
  count: number;
}
