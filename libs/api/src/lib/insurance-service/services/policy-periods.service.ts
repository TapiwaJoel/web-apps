import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  CreatePolicyPeriodDto,
  GetPolicyPeriodsQueryDto,
  PolicyPeriodResponseDto,
  UpdatePolicyPeriodDto,
} from '../dtos';
import {
  API_BASE_URL,
  HeaderPaginationParams,
  INSURANCE_PATH,
  PaginateResult,
  ServiceResponse,
  buildPaginationHeaders,
  buildUrl,
  mapHttpError,
} from '../../common';

@Injectable({ providedIn: 'root' })
export class PolicyPeriodsService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = inject(API_BASE_URL);

  public create(
    dto: CreatePolicyPeriodDto,
  ): Observable<PolicyPeriodResponseDto> {
    return this.http
      .post<ServiceResponse<PolicyPeriodResponseDto>>(this.url(), dto)
      .pipe(
        map(
          (
            r: ServiceResponse<PolicyPeriodResponseDto>,
          ): PolicyPeriodResponseDto => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public update(
    id: string,
    dto: UpdatePolicyPeriodDto,
  ): Observable<PolicyPeriodResponseDto> {
    return this.http
      .patch<ServiceResponse<PolicyPeriodResponseDto>>(this.url(id), dto)
      .pipe(
        map(
          (
            r: ServiceResponse<PolicyPeriodResponseDto>,
          ): PolicyPeriodResponseDto => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public list(
    query: GetPolicyPeriodsQueryDto = {},
    page: HeaderPaginationParams = {},
  ): Observable<PaginateResult<PolicyPeriodResponseDto>> {
    let params: HttpParams = new HttpParams();
    (Object.entries(query) as [string, unknown][]).forEach(
      ([key, value]: [string, unknown]): void => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, String(value));
        }
      },
    );
    const headers: HttpHeaders = buildPaginationHeaders(page);
    return this.http
      .get<ServiceResponse<PaginateResult<PolicyPeriodResponseDto>>>(
        this.url(),
        {
          headers,
          params,
        },
      )
      .pipe(
        map(
          (
            r: ServiceResponse<PaginateResult<PolicyPeriodResponseDto>>,
          ): PaginateResult<PolicyPeriodResponseDto> => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  private url(...segments: string[]): string {
    return buildUrl(
      this.baseUrl,
      INSURANCE_PATH,
      'policy-periods',
      ...segments,
    );
  }
}
