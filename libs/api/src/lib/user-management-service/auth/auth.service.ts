import { Injectable, signal, computed, inject, Signal } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { User } from './user.model';
import { TokenService } from './token.service';

/**
 * Mock Authentication Service
 * This service provides local authentication without any backend API calls.
 * Perfect for development and testing.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private tokenService: TokenService = inject(TokenService);

  private readonly currentUserSignal: ReturnType<typeof signal<User | null>> =
    signal<User | null>(null);

  public readonly currentUser: Signal<User | null> =
    this.currentUserSignal.asReadonly();

  public readonly isAuthenticated: ReturnType<typeof computed<boolean>> =
    computed(() => !!this.currentUserSignal());

  public constructor() {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token: string | null = this.tokenService.getToken();
    if (token) {
      // Load mock user from stored token
      this.checkAuth().subscribe();
    }
  }

  /**
   * Mock login - accepts any credentials and logs in successfully
   * No API calls are made
   */
  public login(credentials: {
    email: string;
    password: string;
  }): Observable<User> {
    // Create a mock user based on the credentials
    const mockUser: User = {
      id: '1',
      email: credentials.email,
      name: credentials.email.split('@')[0] || 'User',
    };

    // Create mock tokens
    const mockToken: string = 'mock-jwt-token-' + Date.now();
    const mockRefreshToken: string = 'mock-refresh-token-' + Date.now();

    // Simulate API delay
    return of({
      user: mockUser,
      token: mockToken,
      refreshToken: mockRefreshToken,
    }).pipe(
      delay(300), // Simulate network delay
      tap((response) => {
        this.tokenService.setToken(response.token);
        this.tokenService.setRefreshToken(response.refreshToken);
        this.currentUserSignal.set(response.user);
      }),
      map((response) => response.user),
    );
  }

  /**
   * Mock logout - clears local state
   * No API calls are made
   */
  public logout(): Observable<void> {
    return of(void 0).pipe(
      delay(100),
      tap(() => {
        this.tokenService.clearTokens();
        this.currentUserSignal.set(null);
      }),
    );
  }

  /**
   * Mock token refresh
   * No API calls are made
   */
  public refreshToken(): Observable<string> {
    const mockToken: string = 'mock-jwt-token-refreshed-' + Date.now();
    const mockRefreshToken: string =
      'mock-refresh-token-refreshed-' + Date.now();

    return of({ token: mockToken, refreshToken: mockRefreshToken }).pipe(
      delay(200),
      tap((response) => {
        this.tokenService.setToken(response.token);
        this.tokenService.setRefreshToken(response.refreshToken);
      }),
      map((response) => response.token),
    );
  }

  /**
   * Mock auth check - returns stored user
   * No API calls are made
   */
  public checkAuth(): Observable<boolean> {
    const token: string | null = this.tokenService.getToken();

    if (!token) {
      return of(false);
    }

    // Create mock user from token
    const mockUser: User = {
      id: '1',
      email: 'user@example.com',
      name: 'Mock User',
    };

    return of({ user: mockUser }).pipe(
      delay(100),
      tap((response) => {
        this.currentUserSignal.set(response.user);
      }),
      map(() => true),
    );
  }

  public getCurrentUser(): User | null {
    return this.currentUserSignal();
  }

  public isAuthenticatedValue(): boolean {
    return !!this.currentUserSignal();
  }
}
