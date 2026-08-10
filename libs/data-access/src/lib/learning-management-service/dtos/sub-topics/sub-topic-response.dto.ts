import { AccessLevel, ContentStatus } from '../../enums';

export interface SubTopicResponseDto {
  _id: string;
  topicId: string;
  name: string;
  learningObjectives: string;
  estimatedDurationMinutes: number;
  order: number;
  status: ContentStatus;
  accessLevel: AccessLevel;
  articleId?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}
