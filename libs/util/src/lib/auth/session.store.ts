import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import {
  AuthenticationService,
  SystemUserResponseDto,
  UserPermissionsResponseDto,
  UserResponseDto,
  WebAuthenticationResponseDto,
} from '@mushaviri/api';

/**
 * Holds the current session as signals.
 *
 * Auth is httpOnly-cookie based, so the JWT is deliberately unreadable from JS and
 * there is nothing to persist client-side. Route guards need a synchronous answer to
 * "is there a session?" on every navigation, which this provides without a network
 * round trip; `restore()` performs the single server probe needed after a reload.
 *
 * Deliberately state-only — components call `AuthenticationService` themselves and
 * hand the result here. Lives in `util` (not `api`) because `api` holds generated
 * stubs that can be regenerated at any time.
 */
@Injectable({ providedIn: 'root' })
export class SessionStore {
  // Injected services
  private readonly authenticationService: AuthenticationService = inject(
    AuthenticationService,
  );

  // Internal state
  private readonly userSignal: ReturnType<
    typeof signal<UserResponseDto | null>
  > = signal<UserResponseDto | null>(null);
  private readonly systemUserSignal: ReturnType<
    typeof signal<SystemUserResponseDto | null>
  > = signal<SystemUserResponseDto | null>(null);
  private readonly permissionsSignal: ReturnType<typeof signal<string[]>> =
    signal<string[]>([]);
  /**
   * Tracked separately from `user`: `restore()` re-establishes a session from the
   * cookie without returning the user, so deriving auth purely from `user` would
   * read a valid reload as logged-out.
   */
  private readonly authenticatedSignal: ReturnType<typeof signal<boolean>> =
    signal<boolean>(false);

  // Public signals
  public readonly user: Signal<UserResponseDto | null> =
    this.userSignal.asReadonly();
  public readonly systemUser: Signal<SystemUserResponseDto | null> =
    this.systemUserSignal.asReadonly();
  public readonly permissions: Signal<string[]> =
    this.permissionsSignal.asReadonly();
  public readonly isAuthenticated: ReturnType<typeof computed<boolean>> =
    computed(() => this.authenticatedSignal());

  // Public methods
  /** Adopt the session returned by a successful login or token refresh. */
  public set(response: WebAuthenticationResponseDto): void {
    this.userSignal.set(response.user ?? null);
    this.systemUserSignal.set(response.systemUser ?? null);
    this.authenticatedSignal.set(true);
  }

  public clear(): void {
    this.userSignal.set(null);
    this.systemUserSignal.set(null);
    this.permissionsSignal.set([]);
    this.authenticatedSignal.set(false);
  }

  /**
   * Probes an authenticated endpoint to detect a valid session cookie after a
   * reload. Returns `false` instead of throwing so it can gate app initialization.
   */
  public restore(): Observable<boolean> {
    return this.authenticationService.myPermissions().pipe(
      tap((response: UserPermissionsResponseDto): void => {
        this.permissionsSignal.set(response.permissions ?? []);
        this.authenticatedSignal.set(true);
      }),
      map((): boolean => true),
      catchError((): Observable<boolean> => {
        this.clear();
        return of(false);
      }),
    );
  }

  /** Synchronous read for route guards, which cannot await a signal. */
  public isAuthenticatedValue(): boolean {
    return this.authenticatedSignal();
  }
}
