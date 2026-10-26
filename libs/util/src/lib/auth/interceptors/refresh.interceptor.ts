import {
  HttpErrorResponse,
  HttpEvent,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  API_BASE_URL,
  AuthenticationService,
  WebAuthenticationResponseDto,
} from '@mushaviri/api';
import {
  Observable,
  catchError,
  finalize,
  shareReplay,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { SessionStore } from '../session.store';

const AUTH_ENDPOINTS: readonly string[] = [
  'authentications/login',
  'authentications/refresh-token',
  'authentications/logout',
];

/**
 * True only when `error` proves the refresh token itself is invalid/expired
 * (401/403). A network error, 500, or other failure doesn't mean the session
 * is bad — it means the refresh call couldn't complete right now.
 */
function isInvalidSessionError(error: unknown): boolean {
  return (
    error instanceof HttpErrorResponse &&
    (error.status === 401 || error.status === 403)
  );
}

/**
 * Coordinates concurrent refresh attempts: every 401 that arrives while a
 * refresh is already in flight awaits that same call instead of firing its
 * own, so a burst of requests failing together triggers one refresh, not N.
 */
@Injectable({ providedIn: 'root' })
class RefreshCoordinator {
  private readonly authenticationService: AuthenticationService = inject(
    AuthenticationService,
  );
  private readonly sessionStore: SessionStore = inject(SessionStore);

  private inFlight: Observable<WebAuthenticationResponseDto> | null = null;

  public refresh(): Observable<WebAuthenticationResponseDto> {
    if (!this.inFlight) {
      const shared: Observable<WebAuthenticationResponseDto> =
        this.authenticationService.refreshToken().pipe(
          tap((response: WebAuthenticationResponseDto): void => {
            this.sessionStore.set(response);
          }),
          catchError((error: unknown): Observable<never> => {
            if (isInvalidSessionError(error)) {
              this.sessionStore.clear();
            }
            return throwError((): unknown => error);
          }),
          finalize((): void => {
            this.inFlight = null;
          }),
          shareReplay({ bufferSize: 1, refCount: false }),
        );
      this.inFlight = shared;
    }
    return this.inFlight;
  }
}

function isAuthEndpoint(url: string, baseUrl: string): boolean {
  return AUTH_ENDPOINTS.some((endpoint: string) =>
    url.startsWith(`${baseUrl}/user-management-service/${endpoint}`),
  );
}

/**
 * Recovers from an expired access token: on a 401 from the API, refreshes
 * the session via the httpOnly refresh-token cookie and retries the original
 * request once. Only sends the user to `/login` if the refresh call proves
 * the session itself is invalid (401/403) — a network error or 500 from the
 * refresh endpoint just propagates, since it doesn't mean the session is bad.
 */
export const refreshInterceptor: HttpInterceptorFn = (req, next) => {
  const baseUrl: string = inject(API_BASE_URL);
  const coordinator: RefreshCoordinator = inject(RefreshCoordinator);
  const router: Router = inject(Router);

  if (
    !baseUrl ||
    !req.url.startsWith(baseUrl) ||
    isAuthEndpoint(req.url, baseUrl)
  ) {
    return next(req);
  }

  return next(req).pipe(
    catchError((error: unknown): Observable<HttpEvent<unknown>> => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401) {
        return throwError((): unknown => error);
      }

      return coordinator.refresh().pipe(
        switchMap((): Observable<HttpEvent<unknown>> => next(req.clone())),
        catchError((refreshError: unknown): Observable<never> => {
          if (isInvalidSessionError(refreshError)) {
            router.navigate(['/login']);
          }
          return throwError((): unknown => refreshError);
        }),
      );
    }),
  );
};
