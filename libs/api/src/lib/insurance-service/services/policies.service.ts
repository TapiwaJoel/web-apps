import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  CreatePolicyDto,
  GetPoliciesQueryDto,
  PolicyResponseDto,
  UpdatePolicyDto,
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
export class PoliciesService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = inject(API_BASE_URL);

  public create(dto: CreatePolicyDto): Observable<PolicyResponseDto> {
    return this.http
      .post<ServiceResponse<PolicyResponseDto>>(this.url(), dto)
      .pipe(
        map(
          (r: ServiceResponse<PolicyResponseDto>): PolicyResponseDto => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public update(
    id: string,
    dto: UpdatePolicyDto,
  ): Observable<PolicyResponseDto> {
    return this.http
      .patch<ServiceResponse<PolicyResponseDto>>(this.url(id), dto)
      .pipe(
        map(
          (r: ServiceResponse<PolicyResponseDto>): PolicyResponseDto => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public list(
    query: GetPoliciesQueryDto = {},
    page: HeaderPaginationParams = {},
  ): Observable<PaginateResult<PolicyResponseDto>> {
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
      .get<ServiceResponse<PaginateResult<PolicyResponseDto>>>(this.url(), {
        headers,
        params,
      })
      .pipe(
        map(
          (
            r: ServiceResponse<PaginateResult<PolicyResponseDto>>,
          ): PaginateResult<PolicyResponseDto> => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  private url(...segments: string[]): string {
    return buildUrl(this.baseUrl, INSURANCE_PATH, 'policies', ...segments);
  }
}
