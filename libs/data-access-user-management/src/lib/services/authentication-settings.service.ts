import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  AuthenticationSettingsResponseDto,
  ServiceResponse,
} from '@mushaviri/api-contracts';
import {
  API_BASE_URL,
  buildUrl,
  mapHttpError,
  USER_MANAGEMENT_PATH,
} from '../core';

@Injectable({ providedIn: 'root' })
export class AuthenticationSettingsService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = inject(API_BASE_URL);

  public get(): Observable<AuthenticationSettingsResponseDto> {
    return this.http
      .get<ServiceResponse<AuthenticationSettingsResponseDto>>(this.url())
      .pipe(
        map(
          (
            r: ServiceResponse<AuthenticationSettingsResponseDto>,
          ): AuthenticationSettingsResponseDto => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public update(
    id: string,
    body: Partial<AuthenticationSettingsResponseDto>,
  ): Observable<AuthenticationSettingsResponseDto> {
    return this.http
      .patch<ServiceResponse<AuthenticationSettingsResponseDto>>(
        this.url(id),
        body,
      )
      .pipe(
        map(
          (
            r: ServiceResponse<AuthenticationSettingsResponseDto>,
          ): AuthenticationSettingsResponseDto => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  private url(...segments: string[]): string {
    return buildUrl(
      this.baseUrl,
      USER_MANAGEMENT_PATH,
      'authentication-settings',
      ...segments,
    );
  }
}
