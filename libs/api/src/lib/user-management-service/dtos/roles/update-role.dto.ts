import { EntityStatus } from '../../../common';

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  serviceName?: string;
  isSensitive?: boolean;
  status?: EntityStatus;
}
