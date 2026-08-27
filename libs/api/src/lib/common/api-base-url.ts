import { InjectionToken } from '@angular/core';

/** Gateway origin, e.g. https://api.mushaviri.com:8443. Provided per app from environment.apiBaseUrl. */
export const API_BASE_URL: InjectionToken<string> = new InjectionToken<string>(
  'API_BASE_URL',
);
