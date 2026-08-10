import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  LoginDto,
  LogoutRequestDto,
  UserPermissionsResponseDto,
  WebAuthenticationResponseDto,
} from '../dtos';
import { ServiceResponse } from '../../common';
import {
  API_BASE_URL,
  buildUrl,
  mapHttpError,
  USER_MANAGEMENT_PATH,
} from '../../core';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = inject(API_BASE_URL);

  public login(dto: LoginDto): Observable<WebAuthenticationResponseDto> {
    return this.http
      .post<ServiceResponse<WebAuthenticationResponseDto>>(
        this.url('authentications', 'login'),
        dto,
      )
      .pipe(
        map(
          (
            r: ServiceResponse<WebAuthenticationResponseDto>,
          ): WebAuthenticationResponseDto => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public logout(dto: LogoutRequestDto): Observable<void> {
    return this.http
      .post<ServiceResponse<void>>(this.url('authentications', 'logout'), dto)
      .pipe(
        map((): void => undefined),
        catchError(mapHttpError),
      );
  }

  public refreshToken(): Observable<WebAuthenticationResponseDto> {
    return this.http
      .post<ServiceResponse<WebAuthenticationResponseDto>>(
        this.url('authentications', 'refresh-token'),
        {},
      )
      .pipe(
        map(
          (
            r: ServiceResponse<WebAuthenticationResponseDto>,
          ): WebAuthenticationResponseDto => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public myPermissions(): Observable<UserPermissionsResponseDto> {
    return this.http
      .get<ServiceResponse<UserPermissionsResponseDto>>(
        this.url('authentications', 'my-permissions'),
      )
      .pipe(
        map(
          (
            r: ServiceResponse<UserPermissionsResponseDto>,
          ): UserPermissionsResponseDto => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  private url(...segments: string[]): string {
    return buildUrl(this.baseUrl, USER_MANAGEMENT_PATH, ...segments);
  }
}
