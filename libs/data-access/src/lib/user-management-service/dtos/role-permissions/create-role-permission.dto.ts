export interface CreateRolePermissionDto {
  _id?: string;
  grantedBy?: string;
  status?: string;
  roleId: string;
  permissionId: string;
}
