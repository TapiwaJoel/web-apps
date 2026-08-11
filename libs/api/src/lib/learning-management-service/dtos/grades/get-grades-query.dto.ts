import { EntityStatus, PaginationParams } from '../../../common';

export interface GetGradesQueryDto extends PaginationParams {
  _id?: string;
  name?: string;
  educationalLevelId?: string;
  status?: EntityStatus;
}
