import { RoleResponseDto } from '../../dtos';

export interface RolesState {
  roles: RoleResponseDto[];
  rolesLoaded: boolean;
  rolesLoading: boolean;
  rolesError: string | null;
  /** `serviceName` the cached `roles` list was loaded for (`null` = unscoped). */
  rolesScope: string | null;
  /** Serialized in-flight queries, so concurrent identical lookups don't double-request. */
  rolesQueriesFetching: string[];
}
