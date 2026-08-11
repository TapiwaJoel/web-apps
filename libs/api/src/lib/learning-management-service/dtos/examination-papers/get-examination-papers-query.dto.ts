import { EntityStatus, PaginationParams } from '../../../common';

export interface GetExaminationPapersQueryDto extends PaginationParams {
  _id?: string;
  subjectId?: string;
  name?: string;
  status?: EntityStatus;
}
