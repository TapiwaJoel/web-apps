import { Action, EntityStatus } from '../enums';

export interface UpdatePermissionDto {
  name?: string;
  serviceName?: string;
  resource?: string;
  action?: Action;
  description?: string;
  status?: EntityStatus;
}
