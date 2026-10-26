import { ContentStatus } from '../../enums';

export interface GetTopicsQueryDto {
  _id?: string;
  subjectId?: string;
  name?: string;
  gradeId?: string;
  status?: ContentStatus;
}
