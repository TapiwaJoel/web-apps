import { InjectionToken } from '@angular/core';

/** Gateway origin, e.g. http://localhost:3000. Provided per app from environment.apiBaseUrl. */
export const API_BASE_URL: InjectionToken<string> = new InjectionToken<string>(
  'API_BASE_URL',
);

/** First path segment the gateway uses to route to user-management-service. */
export const USER_MANAGEMENT_PATH: string = 'user-management-service';
