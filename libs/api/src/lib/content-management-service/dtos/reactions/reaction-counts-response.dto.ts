import { ReactionType } from '../../enums';
import { ReactionCountDto } from './reaction-count.dto';

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
