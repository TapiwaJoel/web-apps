import { SubTopicResponseDto } from '../../dtos';

export interface SubTopicsState {
  subTopics: SubTopicResponseDto[];
  subTopicsLoaded: boolean;
  subTopicsLoading: boolean;
  subTopicsError: string | null;
}
