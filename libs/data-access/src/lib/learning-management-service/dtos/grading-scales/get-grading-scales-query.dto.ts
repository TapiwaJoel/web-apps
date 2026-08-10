import { EntityStatus, PaginationParams } from '../../../common';

export interface GetGradingScalesQueryDto extends PaginationParams {
  _id?: string;
  gradingSystemId?: string;
  status?: EntityStatus;
}
