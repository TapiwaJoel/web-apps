/**
 * DTO for querying reaction counts for a specific entity.
 * Both reactionable and reactionableId are required.
 */
export interface GetReactionCountsQueryDto {
  reactionable: string;
  reactionableId: string;
}
