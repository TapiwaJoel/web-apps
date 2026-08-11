import { EntityStatus } from '../../../common';

export interface RoleResponseDto {
  _id: string;
  name: string;
  description?: string;
  serviceName?: string;
  isSensitive: boolean;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}
