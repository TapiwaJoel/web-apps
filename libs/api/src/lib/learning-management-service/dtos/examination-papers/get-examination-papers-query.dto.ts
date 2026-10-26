import { EntityStatus } from '../../../common';

export interface GetExaminationPapersQueryDto {
  _id?: string;
  subjectId?: string;
  name?: string;
  status?: EntityStatus;
}
