import { EntityStatus } from '../enums';

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  serviceName?: string;
  isSensitive?: boolean;
  status?: EntityStatus;
}
