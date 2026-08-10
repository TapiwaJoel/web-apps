import { ContentStatus } from '../enums';

export interface CreateTopicDto {
  subjectId: string;
  name: string;
  order: number;
  gradeId: string;
  status?: ContentStatus;
}
