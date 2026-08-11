import { EntityStatus, PaginationParams } from '../../../common';

export interface GetExaminationsQueryDto extends PaginationParams {
  _id?: string;
  name?: string;
  educationalLevelId?: string;
  examinationBoardId?: string;
  status?: EntityStatus;
}
