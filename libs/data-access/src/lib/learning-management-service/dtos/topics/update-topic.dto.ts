import { ContentStatus } from '../enums';

export interface UpdateTopicDto {
  subjectId?: string;
  name?: string;
  order?: number;
  gradeId?: string;
  status?: ContentStatus;
}
