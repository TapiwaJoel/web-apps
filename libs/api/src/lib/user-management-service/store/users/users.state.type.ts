import { SystemUserResponseDto } from '../../dtos';

export interface UsersState {
  users: SystemUserResponseDto[];
  usersLoaded: boolean;
  usersLoading: boolean;
  usersError: string | null;
  /** `serviceName` the cached `users` list was loaded for (`null` = unscoped). */
  usersScope: string | null;
}
