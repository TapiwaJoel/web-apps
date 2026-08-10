import { Action } from '../enums';
import { EntityStatus } from '../../../common';

export interface UpdatePermissionDto {
  name?: string;
  serviceName?: string;
  resource?: string;
  action?: Action;
  description?: string;
  status?: EntityStatus;
}
