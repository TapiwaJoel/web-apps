import { TopicResponseDto } from '../../dtos';

export interface TopicsState {
  topics: TopicResponseDto[];
  topicsLoaded: boolean;
  topicsLoading: boolean;
  topicsError: string | null;
}
