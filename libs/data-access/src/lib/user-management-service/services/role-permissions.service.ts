import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  CreateRolePermissionDto,
  RolePermissionResponseDto,
} from '../dtos';
import {
  API_BASE_URL,
  PaginateResult,
  ServiceResponse,
  USER_MANAGEMENT_PATH,
  buildUrl,
  mapHttpError,
} from '../../common';

@Injectable({ providedIn: 'root' })
export class RolePermissionsService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = inject(API_BASE_URL);

  public create(
    dto: CreateRolePermissionDto,
  ): Observable<RolePermissionResponseDto> {
    return this.http
      .post<ServiceResponse<RolePermissionResponseDto>>(this.url(), dto)
      .pipe(
        map(
          (
            r: ServiceResponse<RolePermissionResponseDto>,
          ): RolePermissionResponseDto => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public update(
    id: string,
    dto: Partial<CreateRolePermissionDto>,
  ): Observable<RolePermissionResponseDto> {
    return this.http
      .patch<ServiceResponse<RolePermissionResponseDto>>(this.url(id), dto)
      .pipe(
        map(
          (
            r: ServiceResponse<RolePermissionResponseDto>,
          ): RolePermissionResponseDto => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public list(): Observable<PaginateResult<RolePermissionResponseDto>> {
    return this.http
      .get<ServiceResponse<PaginateResult<RolePermissionResponseDto>>>(
        this.url(),
      )
      .pipe(
        map(
          (
            r: ServiceResponse<PaginateResult<RolePermissionResponseDto>>,
          ): PaginateResult<RolePermissionResponseDto> => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  private url(...segments: string[]): string {
    return buildUrl(
      this.baseUrl,
      USER_MANAGEMENT_PATH,
      'role-permissions',
      ...segments,
    );
  }
}
