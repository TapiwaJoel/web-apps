import { EntityStatus, PaginationParams } from '../../../common';

export interface GetGradingSystemsQueryDto extends PaginationParams {
  _id?: string;
  name?: string;
  examinationId?: string;
  status?: EntityStatus;
}
