import { EntityStatus } from '../enums';

export interface RolePermissionResponseDto {
  _id: string;
  roleId: string;
  permissionId: string;
  grantedBy: string;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}
