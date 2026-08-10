import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  CreateSystemUserDto,
  PaginateResult,
  PaginationParams,
  ServiceResponse,
  SystemUserResponseDto,
} from '../dtos';
import {
  API_BASE_URL,
  buildUrl,
  mapHttpError,
  USER_MANAGEMENT_PATH,
} from '../../core';

@Injectable({ providedIn: 'root' })
export class SystemUsersService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = inject(API_BASE_URL);

  public create(
    dto: CreateSystemUserDto,
  ): Observable<SystemUserResponseDto> {
    return this.http
      .post<ServiceResponse<SystemUserResponseDto>>(this.url(), dto)
      .pipe(
        map(
          (
            r: ServiceResponse<SystemUserResponseDto>,
          ): SystemUserResponseDto => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public update(
    systemUserId: string,
    dto: Partial<CreateSystemUserDto>,
  ): Observable<SystemUserResponseDto> {
    return this.http
      .patch<ServiceResponse<SystemUserResponseDto>>(
        this.url(systemUserId),
        dto,
      )
      .pipe(
        map(
          (
            r: ServiceResponse<SystemUserResponseDto>,
          ): SystemUserResponseDto => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public list(
    query: Partial<PaginationParams> = {},
  ): Observable<PaginateResult<SystemUserResponseDto>> {
    let params: HttpParams = new HttpParams();
    (Object.entries(query) as [string, unknown][]).forEach(
      ([key, value]: [string, unknown]): void => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, String(value));
        }
      },
    );
    return this.http
      .get<ServiceResponse<PaginateResult<SystemUserResponseDto>>>(
        this.url(),
        { params },
      )
      .pipe(
        map(
          (
            r: ServiceResponse<PaginateResult<SystemUserResponseDto>>,
          ): PaginateResult<SystemUserResponseDto> => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  private url(...segments: string[]): string {
    return buildUrl(
      this.baseUrl,
      USER_MANAGEMENT_PATH,
      'system-users',
      ...segments,
    );
  }
}
