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

/**
 * ReactionCountsResponseDto
 *
 * Data transfer object for returning aggregated reaction counts by type.
 * Used to display reaction statistics for an entity.
 */
export interface ReactionCountsResponseDto {
  reactionable: string;
  reactionableId: string;
  totalCount: number;
  reactionCounts: ReactionCountDto[];
  userReaction: ReactionType | null;
}
