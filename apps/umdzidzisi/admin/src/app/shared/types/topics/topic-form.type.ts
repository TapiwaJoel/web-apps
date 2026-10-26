import { ContentStatus } from '@mushaviri/api';

export interface TopicForm {
  subjectId: string;
  gradeId: string;
  name: string;
  order: number | null;
  status: ContentStatus;
}
