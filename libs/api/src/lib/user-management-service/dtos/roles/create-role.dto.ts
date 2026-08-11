import { EntityStatus } from '../../../common';

export interface CreateRoleDto {
  name: string;
  description?: string;
  serviceName?: string;
  isSensitive?: boolean;
  status?: EntityStatus;
}
