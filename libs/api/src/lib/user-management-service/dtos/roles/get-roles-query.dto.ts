import { EntityStatus, PaginationParams } from '../../../common';

export interface GetRolesQueryDto extends PaginationParams {
  _id?: string;
  name?: string;
  status?: EntityStatus;
  serviceName?: string;
  isSensitive?: boolean;
}
