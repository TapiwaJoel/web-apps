import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  CreatePolicyPurchaseDto,
  GetPolicyPurchasesQueryDto,
  PolicyPurchaseResponseDto,
  UpdatePolicyPurchaseDto,
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
export class PolicyPurchasesService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = inject(API_BASE_URL);

  public create(
    dto: CreatePolicyPurchaseDto,
  ): Observable<PolicyPurchaseResponseDto> {
    return this.http
      .post<ServiceResponse<PolicyPurchaseResponseDto>>(this.url(), dto)
      .pipe(
        map(
          (
            r: ServiceResponse<PolicyPurchaseResponseDto>,
          ): PolicyPurchaseResponseDto => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public update(
    id: string,
    dto: UpdatePolicyPurchaseDto,
  ): Observable<PolicyPurchaseResponseDto> {
    return this.http
      .patch<ServiceResponse<PolicyPurchaseResponseDto>>(this.url(id), dto)
      .pipe(
        map(
          (
            r: ServiceResponse<PolicyPurchaseResponseDto>,
          ): PolicyPurchaseResponseDto => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public list(
    query: GetPolicyPurchasesQueryDto = {},
    page: HeaderPaginationParams = {},
  ): Observable<PaginateResult<PolicyPurchaseResponseDto>> {
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
      .get<ServiceResponse<PaginateResult<PolicyPurchaseResponseDto>>>(
        this.url(),
        {
          headers,
          params,
        },
      )
      .pipe(
        map(
          (
            r: ServiceResponse<PaginateResult<PolicyPurchaseResponseDto>>,
          ): PaginateResult<PolicyPurchaseResponseDto> => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  private url(...segments: string[]): string {
    return buildUrl(
      this.baseUrl,
      INSURANCE_PATH,
      'policy-purchases',
      ...segments,
    );
  }
}
