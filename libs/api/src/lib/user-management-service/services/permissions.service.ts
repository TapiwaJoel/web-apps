import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  CreatePermissionDto,
  PermissionResponseDto,
  UpdatePermissionDto,
} from '../dtos';
import {
  API_BASE_URL,
  buildPaginationHeaders,
  PaginateResult,
  ServiceResponse,
  USER_MANAGEMENT_PATH,
  buildUrl,
  mapHttpError,
} from '../../common';

@Injectable({ providedIn: 'root' })
export class PermissionsService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = inject(API_BASE_URL);

  public create(dto: CreatePermissionDto): Observable<PermissionResponseDto> {
    return this.http
      .post<ServiceResponse<PermissionResponseDto>>(this.url(), dto)
      .pipe(
        map(
          (r: ServiceResponse<PermissionResponseDto>): PermissionResponseDto =>
            r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public update(
    id: string,
    dto: UpdatePermissionDto,
  ): Observable<PermissionResponseDto> {
    return this.http
      .patch<ServiceResponse<PermissionResponseDto>>(this.url(id), dto)
      .pipe(
        map(
          (r: ServiceResponse<PermissionResponseDto>): PermissionResponseDto =>
            r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public list(
    query: { serviceName?: string; page?: number } = {},
  ): Observable<PaginateResult<PermissionResponseDto>> {
    const { page, ...rest }: { serviceName?: string; page?: number } = query;
    let params: HttpParams = new HttpParams();
    (Object.entries(rest) as [string, unknown][]).forEach(
      ([key, value]: [string, unknown]): void => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, String(value));
        }
      },
    );
    return this.http
      .get<ServiceResponse<PaginateResult<PermissionResponseDto>>>(this.url(), {
        params,
        headers: buildPaginationHeaders({ limit: 100, page }),
      })
      .pipe(
        map(
          (
            r: ServiceResponse<PaginateResult<PermissionResponseDto>>,
          ): PaginateResult<PermissionResponseDto> => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  private url(...segments: string[]): string {
    return buildUrl(
      this.baseUrl,
      USER_MANAGEMENT_PATH,
      'permissions',
      ...segments,
    );
  }
}
