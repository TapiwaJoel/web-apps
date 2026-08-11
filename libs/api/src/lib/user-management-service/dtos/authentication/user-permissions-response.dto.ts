export interface UserPermissionsResponseDto {
  roleId: string;
  roleName: string;
  roleDescription?: string;
  permissions: string[];
}
