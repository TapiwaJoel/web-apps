import { EntityStatus } from '../../../common';

export interface GetExaminationsQueryDto {
  _id?: string;
  name?: string;
  educationalLevelId?: string;
  examinationBoardId?: string;
  status?: EntityStatus;
}
