import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  CreateRoleDto,
  RoleResponseDto,
  UpdateRoleDto,
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
export class RolesService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = inject(API_BASE_URL);

  public create(dto: CreateRoleDto): Observable<RoleResponseDto> {
    return this.http
      .post<ServiceResponse<RoleResponseDto>>(this.url(), dto)
      .pipe(
        map((r: ServiceResponse<RoleResponseDto>): RoleResponseDto => r.data),
        catchError(mapHttpError),
      );
  }

  public update(
    id: string,
    dto: UpdateRoleDto,
  ): Observable<RoleResponseDto> {
    return this.http
      .patch<ServiceResponse<RoleResponseDto>>(this.url(id), dto)
      .pipe(
        map((r: ServiceResponse<RoleResponseDto>): RoleResponseDto => r.data),
        catchError(mapHttpError),
      );
  }

  public list(): Observable<PaginateResult<RoleResponseDto>> {
    return this.http
      .get<ServiceResponse<PaginateResult<RoleResponseDto>>>(this.url())
      .pipe(
        map(
          (
            r: ServiceResponse<PaginateResult<RoleResponseDto>>,
          ): PaginateResult<RoleResponseDto> => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  private url(...segments: string[]): string {
    return buildUrl(this.baseUrl, USER_MANAGEMENT_PATH, 'roles', ...segments);
  }
}
