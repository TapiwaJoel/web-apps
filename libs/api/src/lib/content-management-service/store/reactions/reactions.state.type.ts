import { ReactionResponseDto, ReactionTypeMetadataDto } from '../../dtos';

export interface ReactionsState {
  reactions: ReactionResponseDto[];
  reactionTypes: ReactionTypeMetadataDto[];
  reactionTypesLoaded: boolean;
  reactionsLoading: boolean;
  reactionsError: string | null;
}
