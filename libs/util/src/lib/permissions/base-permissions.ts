import { EntityStatus, PermissionResponseDto } from '@mushaviri/api';

/**
 * `serviceName` on seeded permissions is inconsistent in practice — the same
 * logical service shows up under both a short form (`user-management`) and
 * the canonical `*-service` form (`user-management-service`), evidently from
 * a naming convention change that was never backfilled. Matching a bare
 * prefix (stripping a trailing `-service`) covers both without hardcoding
 * every historical alias.
 */
function normalizeServiceName(serviceName: string): string {
  return serviceName.replace(/-service$/, '');
}

/** Every active permission from these services is auto-assigned in full. */
const FULL_ACCESS_SERVICE_NAMES: ReadonlySet<string> = new Set([
  'payment-gateway',
  'messaging',
]);

/**
 * From user-management, only these specific least-privilege permissions are
 * auto-assigned — traced against the backend's actual `@RequiredPermission`
 * guards (in the sibling backend-services repo) for what a normal logged-in
 * admin session actually needs: viewing/managing own devices, viewing own
 * audit trail, viewing/updating own auth (2FA) settings, and reading the
 * permissions catalog. Deliberately excludes every `roles.*` permission and
 * every non-self user-management permission (e.g. `users.*`,
 * `system-users.*`) — those stay fully manual.
 */
const USER_MANAGEMENT_LEAST_PRIVILEGE_NAMES: ReadonlySet<string> = new Set([
  'audit-trail.read_self',
  'devices.read_self',
  'devices.update_self',
  'devices.logout_self',
  'authentication-settings.read_self',
  'authentication-settings.update_self',
  'permissions.read',
]);

/** Narrows the full cross-service permission catalog down to the auto-assign set. */
export function selectAutoAssignPermissions(
  permissions: PermissionResponseDto[],
): PermissionResponseDto[] {
  return permissions.filter((permission: PermissionResponseDto): boolean => {
    if (permission.status !== EntityStatus.ACTIVE) {
      return false;
    }
    const service: string = normalizeServiceName(permission.serviceName);
    if (FULL_ACCESS_SERVICE_NAMES.has(service)) {
      return true;
    }
    if (service === 'user-management') {
      return USER_MANAGEMENT_LEAST_PRIVILEGE_NAMES.has(permission.name);
    }
    return false;
  });
}
