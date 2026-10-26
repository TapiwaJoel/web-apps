import { CreateSubTopicForm } from './create-sub-topic-form.type';

export const EMPTY_CREATE_SUB_TOPIC_FORM: CreateSubTopicForm = {
  topicId: '',
  name: '',
  learningObjectives: '',
  estimatedDurationMinutes: 30,
  order: 1,
  articleId: '',
};
