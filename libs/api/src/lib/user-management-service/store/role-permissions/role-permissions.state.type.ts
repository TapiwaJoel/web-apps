import { RolePermissionResponseDto } from '../../dtos';

export interface RolePermissionsState {
  rolePermissions: RolePermissionResponseDto[];
  rolePermissionsLoaded: boolean;
  rolePermissionsLoading: boolean;
  rolePermissionsError: string | null;
}
