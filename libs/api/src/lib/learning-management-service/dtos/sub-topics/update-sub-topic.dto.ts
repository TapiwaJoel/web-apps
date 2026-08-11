import { AccessLevel, ContentStatus } from '../../enums';

export interface UpdateSubTopicDto {
  topicId?: string;
  name?: string;
  learningObjectives?: string;
  estimatedDurationMinutes?: number;
  order?: number;
  status?: ContentStatus;
  accessLevel?: AccessLevel;
  articleId?: string;
}
