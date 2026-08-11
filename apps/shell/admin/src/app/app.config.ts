import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  APP_INITIALIZER,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { appRoutes } from './app.routes';
import { authInterceptor, AuthService } from '@mushaviri/data-access';
import { ENVIRONMENT } from '@mushaviri/util';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';

/**
 * Initialize authentication state from localStorage before routing starts.
 * This prevents the race condition where route guards check auth before
 * the user is restored from localStorage on page reload.
 */
export function initializeAuth(
  authService: AuthService,
): () => Observable<boolean> {
  return () => authService.checkAuth();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: ENVIRONMENT, useValue: environment },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuth,
      deps: [AuthService],
      multi: true,
    },
  ],
};
