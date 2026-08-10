import { ReactionType } from '../../enums';

/**
 * ReactionTypeMetadataDto
 *
 * Data transfer object for returning rich metadata about available reaction types.
 * Provides UI rendering information including emoji, display label, and category.
 */
export interface ReactionTypeMetadataDto {
  type: ReactionType;
  emoji: string;
  label: string;
  category: 'positive' | 'negative' | 'neutral';
  sortOrder?: number;
}
