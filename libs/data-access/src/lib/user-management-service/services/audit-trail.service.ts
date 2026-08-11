import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuditTrailResponseDto } from '../dtos';
import {
  API_BASE_URL,
  PaginateResult,
  ServiceResponse,
  USER_MANAGEMENT_PATH,
  buildUrl,
  mapHttpError,
} from '../../common';

@Injectable({ providedIn: 'root' })
export class AuditTrailService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = inject(API_BASE_URL);

  public me(): Observable<PaginateResult<AuditTrailResponseDto>> {
    return this.http
      .get<ServiceResponse<PaginateResult<AuditTrailResponseDto>>>(
        this.url('me'),
      )
      .pipe(
        map(
          (
            r: ServiceResponse<PaginateResult<AuditTrailResponseDto>>,
          ): PaginateResult<AuditTrailResponseDto> => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public list(): Observable<PaginateResult<AuditTrailResponseDto>> {
    return this.http
      .get<ServiceResponse<PaginateResult<AuditTrailResponseDto>>>(
        this.url(),
      )
      .pipe(
        map(
          (
            r: ServiceResponse<PaginateResult<AuditTrailResponseDto>>,
          ): PaginateResult<AuditTrailResponseDto> => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  private url(...segments: string[]): string {
    return buildUrl(
      this.baseUrl,
      USER_MANAGEMENT_PATH,
      'audit-trail',
      ...segments,
    );
  }
}
