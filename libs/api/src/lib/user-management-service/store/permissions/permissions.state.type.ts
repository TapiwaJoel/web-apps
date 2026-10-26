import { PermissionResponseDto } from '../../dtos';

export interface PermissionsState {
  permissions: PermissionResponseDto[];
  permissionsLoaded: boolean;
  permissionsLoading: boolean;
  permissionsError: string | null;
}
