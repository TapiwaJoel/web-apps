import { Action } from '../enums';

export interface CreatePermissionDto {
  name: string;
  serviceName: string;
  resource: string;
  action: Action;
  description: string;
}
