export interface CreateSubTopicDto {
  topicId: string;
  name: string;
  learningObjectives: string;
  estimatedDurationMinutes: number;
  order: number;
  articleId?: string;
}
