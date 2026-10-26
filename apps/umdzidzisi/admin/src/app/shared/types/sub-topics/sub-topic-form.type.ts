import { AccessLevel, ContentStatus } from '@mushaviri/api';

export interface SubTopicForm {
  topicId: string;
  name: string;
  learningObjectives: string;
  estimatedDurationMinutes: number | null;
  order: number | null;
  articleId: string;
  status: ContentStatus;
  accessLevel: AccessLevel;
}
