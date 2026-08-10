import { Action, EntityStatus } from '../enums';

export interface PermissionResponseDto {
  _id: string;
  name: string;
  serviceName: string;
  resource: string;
  action: Action;
  description: string;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}
