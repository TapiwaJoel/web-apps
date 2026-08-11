import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private readonly TOKEN_KEY: string = 'auth_token';
  private readonly REFRESH_TOKEN_KEY: string = 'refresh_token';

  public getToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    return localStorage.getItem(this.TOKEN_KEY);
  }

  public setToken(token: string): void {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  public removeToken(): void {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.removeItem(this.TOKEN_KEY);
  }

  public getRefreshToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  public setRefreshToken(token: string): void {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  public removeRefreshToken(): void {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  public clearTokens(): void {
    this.removeToken();
    this.removeRefreshToken();
  }
}
