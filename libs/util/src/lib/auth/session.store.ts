import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import {
  AuthenticationService,
  AuthenticationSettingsResponseDto,
  DeviceResponseDto,
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
  private readonly accountIdSignal: ReturnType<typeof signal<string | null>> =
    signal<string | null>(null);
  private readonly authenticationSettingsSignal: ReturnType<
    typeof signal<AuthenticationSettingsResponseDto | null>
  > = signal<AuthenticationSettingsResponseDto | null>(null);
  private readonly devicesSignal: ReturnType<
    typeof signal<Partial<DeviceResponseDto>[]>
  > = signal<Partial<DeviceResponseDto>[]>([]);
  private readonly accountCreatedAtSignal: ReturnType<
    typeof signal<string | null>
  > = signal<string | null>(null);
  private readonly accountUpdatedAtSignal: ReturnType<
    typeof signal<string | null>
  > = signal<string | null>(null);
  private readonly roleIdSignal: ReturnType<typeof signal<string | null>> =
    signal<string | null>(null);
  private readonly roleNameSignal: ReturnType<typeof signal<string | null>> =
    signal<string | null>(null);
  private readonly roleDescriptionSignal: ReturnType<
    typeof signal<string | null>
  > = signal<string | null>(null);
  private readonly currentDeviceIdSignal: ReturnType<
    typeof signal<string | null>
  > = signal<string | null>(null);

  // Public signals
  public readonly user: Signal<UserResponseDto | null> =
    this.userSignal.asReadonly();
  public readonly systemUser: Signal<SystemUserResponseDto | null> =
    this.systemUserSignal.asReadonly();
  public readonly permissions: Signal<string[]> =
    this.permissionsSignal.asReadonly();
  public readonly isAuthenticated: ReturnType<typeof computed<boolean>> =
    computed(() => this.authenticatedSignal());
  public readonly accountId: Signal<string | null> =
    this.accountIdSignal.asReadonly();
  public readonly authenticationSettings: Signal<AuthenticationSettingsResponseDto | null> =
    this.authenticationSettingsSignal.asReadonly();
  public readonly devices: Signal<Partial<DeviceResponseDto>[]> =
    this.devicesSignal.asReadonly();
  public readonly accountCreatedAt: Signal<string | null> =
    this.accountCreatedAtSignal.asReadonly();
  public readonly accountUpdatedAt: Signal<string | null> =
    this.accountUpdatedAtSignal.asReadonly();
  public readonly roleId: Signal<string | null> =
    this.roleIdSignal.asReadonly();
  public readonly roleName: Signal<string | null> =
    this.roleNameSignal.asReadonly();
  public readonly roleDescription: Signal<string | null> =
    this.roleDescriptionSignal.asReadonly();
  public readonly currentDeviceId: Signal<string | null> =
    this.currentDeviceIdSignal.asReadonly();
  public readonly isTwoFactorEnabled: Signal<boolean> = computed(
    () => this.authenticationSettingsSignal()?.isTwoFactorEnabled ?? false,
  );

  // Public methods
  /** Adopt the session returned by a successful login or token refresh. */
  public set(response: WebAuthenticationResponseDto): void {
    this.userSignal.set(response.user ?? null);
    this.systemUserSignal.set(response.systemUser ?? null);
    this.authenticatedSignal.set(true);
    this.accountIdSignal.set(response._id ?? null);
    this.authenticationSettingsSignal.set(
      response.authenticationSettings ?? null,
    );
    this.devicesSignal.set(response.device ?? []);
    this.accountCreatedAtSignal.set(response.createdAt ?? null);
    this.accountUpdatedAtSignal.set(response.updatedAt ?? null);
  }

  public clear(): void {
    this.userSignal.set(null);
    this.systemUserSignal.set(null);
    this.permissionsSignal.set([]);
    this.authenticatedSignal.set(false);
    this.accountIdSignal.set(null);
    this.authenticationSettingsSignal.set(null);
    this.devicesSignal.set([]);
    this.accountCreatedAtSignal.set(null);
    this.accountUpdatedAtSignal.set(null);
    this.roleIdSignal.set(null);
    this.roleNameSignal.set(null);
    this.roleDescriptionSignal.set(null);
    this.currentDeviceIdSignal.set(null);
  }

  /**
   * Probes an authenticated endpoint to detect a valid session cookie after a
   * reload. Returns `false` instead of throwing so it can gate app initialization.
   *
   * The access token cookie is short-lived, so a returning user's `refreshToken()`
   * call is expected to succeed on most reloads — it's tried first (not as a
   * fallback) specifically because, unlike `myPermissions()`, its response is
   * shaped exactly like a login response (`user`, `systemUser`,
   * `authenticationSettings`, `device[]`), so `set()` can repopulate the full
   * session from it. Without this, a reload would leave `user()`/`systemUser()`
   * null for the rest of the tab's lifetime — no page depends on that today,
   * but a reload while sitting on the shell's own routes shouldn't silently
   * downgrade the session either. `myPermissions()` is still needed afterwards
   * since only it returns `roleId`/`roleName`/`roleDescription`/`permissions`.
   *
   * Falls back to `myPermissions()` alone if `refreshToken()` fails — covers the
   * case where the access token is still valid but the refresh-token cookie isn't
   * (e.g. it already rotated in another tab). Only clears the session if both
   * calls fail.
   */
  public restore(): Observable<boolean> {
    const applyPermissions: (response: UserPermissionsResponseDto) => void = (
      response: UserPermissionsResponseDto,
    ): void => {
      this.permissionsSignal.set(response.permissions ?? []);
      this.roleIdSignal.set(response.roleId ?? null);
      this.roleNameSignal.set(response.roleName ?? null);
      this.roleDescriptionSignal.set(response.roleDescription ?? null);
      this.currentDeviceIdSignal.set(response.deviceId ?? null);
    };
    const applyPermissionsOnly: (
      response: UserPermissionsResponseDto,
    ) => void = (response: UserPermissionsResponseDto): void => {
      applyPermissions(response);
      this.authenticatedSignal.set(true);
    };

    return this.authenticationService.refreshToken().pipe(
      tap((response: WebAuthenticationResponseDto): void => this.set(response)),
      switchMap(() => this.authenticationService.myPermissions()),
      tap(applyPermissions),
      map((): boolean => true),
      catchError((): Observable<boolean> =>
        this.authenticationService.myPermissions().pipe(
          tap(applyPermissionsOnly),
          map((): boolean => true),
          catchError((): Observable<boolean> => {
            this.clear();
            return of(false);
          }),
        ),
      ),
    );
  }

  /** Synchronous read for route guards, which cannot await a signal. */
  public isAuthenticatedValue(): boolean {
    return this.authenticatedSignal();
  }
}
