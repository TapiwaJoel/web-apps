export interface CreateSubTopicForm {
  topicId: string;
  name: string;
  learningObjectives: string;
  estimatedDurationMinutes: number | null;
  order: number | null;
  articleId: string;
}
