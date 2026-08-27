import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideHttpClient,
  withInterceptors,
  withXsrfConfiguration,
} from '@angular/common/http';
import { appRoutes } from './app.routes';
import { API_BASE_URL } from '@mushaviri/api';
import { apiInterceptor, ENVIRONMENT, SessionStore } from '@mushaviri/util';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    provideHttpClient(
      withInterceptors([apiInterceptor]),
      // Echoes the CSRF cookie back as a header for @fastify/csrf-protection.
      // Angular only attaches this on same-origin requests, so it is inert in dev
      // (:4200 -> :3000) and takes effect once the app is served behind the gateway.
      withXsrfConfiguration({
        cookieName: 'XSRF-TOKEN',
        headerName: 'x-csrf-token',
      }),
    ),
    { provide: API_BASE_URL, useValue: environment.apiBaseUrl },
    { provide: ENVIRONMENT, useValue: environment },
    // The JWT lives in an httpOnly cookie, so a reload cannot read session state
    // locally — probe the server before routing so guards see the real answer.
    // This also closes the race where guards ran before auth was restored.
    provideAppInitializer(() => inject(SessionStore).restore()),
  ],
};
