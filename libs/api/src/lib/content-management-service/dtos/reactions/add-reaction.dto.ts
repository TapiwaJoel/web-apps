import { ReactionType } from '../../enums';

/**
 * AddReactionDto
 *
 * Data transfer object for adding a reaction to an entity.
 * Supports polymorphic association to any entity type.
 */
export interface AddReactionDto {
  reactionable: string;
  reactionableId: string;
  reactionType: ReactionType;
}
