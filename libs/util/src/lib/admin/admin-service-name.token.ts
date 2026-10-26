import { InjectionToken } from '@angular/core';

/**
 * Backend `serviceName` the current product admin manages users and roles
 * for (e.g. `insurance-service`, `learning-management-service`).
 *
 * Provided on each admin remote's root route rather than at bootstrap: the
 * remotes are mounted into a shared shell, so the value has to come from the
 * route tree the shared user-management pages are rendered under.
 */
export const ADMIN_SERVICE_NAME: InjectionToken<string> =
  new InjectionToken<string>('ADMIN_SERVICE_NAME');
