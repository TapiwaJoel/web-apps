import { Action } from '../../enums';
import { EntityStatus } from '../../../common';

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
