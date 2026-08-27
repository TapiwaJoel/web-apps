import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  CreatePolicyHolderDto,
  GetPolicyHoldersQueryDto,
  PolicyHolderResponseDto,
  UpdatePolicyHolderDto,
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
export class PolicyHoldersService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = inject(API_BASE_URL);

  public create(
    dto: CreatePolicyHolderDto,
  ): Observable<PolicyHolderResponseDto> {
    return this.http
      .post<ServiceResponse<PolicyHolderResponseDto>>(this.url(), dto)
      .pipe(
        map(
          (
            r: ServiceResponse<PolicyHolderResponseDto>,
          ): PolicyHolderResponseDto => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public update(
    id: string,
    dto: UpdatePolicyHolderDto,
  ): Observable<PolicyHolderResponseDto> {
    return this.http
      .patch<ServiceResponse<PolicyHolderResponseDto>>(this.url(id), dto)
      .pipe(
        map(
          (
            r: ServiceResponse<PolicyHolderResponseDto>,
          ): PolicyHolderResponseDto => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public list(
    query: GetPolicyHoldersQueryDto = {},
    page: HeaderPaginationParams = {},
  ): Observable<PaginateResult<PolicyHolderResponseDto>> {
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
      .get<ServiceResponse<PaginateResult<PolicyHolderResponseDto>>>(
        this.url(),
        {
          headers,
          params,
        },
      )
      .pipe(
        map(
          (
            r: ServiceResponse<PaginateResult<PolicyHolderResponseDto>>,
          ): PaginateResult<PolicyHolderResponseDto> => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  private url(...segments: string[]): string {
    return buildUrl(
      this.baseUrl,
      INSURANCE_PATH,
      'policy-holders',
      ...segments,
    );
  }
}
