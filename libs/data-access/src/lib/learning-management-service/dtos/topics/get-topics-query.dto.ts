import { ContentStatus } from '../../enums';
import { PaginationParams } from '../../../common';

export interface GetTopicsQueryDto extends PaginationParams {
  _id?: string;
  subjectId?: string;
  name?: string;
  gradeId?: string;
  status?: ContentStatus;
}
