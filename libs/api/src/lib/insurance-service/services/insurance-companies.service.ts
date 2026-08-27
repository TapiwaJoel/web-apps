import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  CreateInsuranceCompanyDto,
  GetInsuranceCompaniesQueryDto,
  InsuranceCompanyResponseDto,
  UpdateInsuranceCompanyDto,
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
export class InsuranceCompaniesService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = inject(API_BASE_URL);

  public create(
    dto: CreateInsuranceCompanyDto,
  ): Observable<InsuranceCompanyResponseDto> {
    return this.http
      .post<ServiceResponse<InsuranceCompanyResponseDto>>(this.url(), dto)
      .pipe(
        map(
          (
            r: ServiceResponse<InsuranceCompanyResponseDto>,
          ): InsuranceCompanyResponseDto => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public update(
    id: string,
    dto: UpdateInsuranceCompanyDto,
  ): Observable<InsuranceCompanyResponseDto> {
    return this.http
      .patch<ServiceResponse<InsuranceCompanyResponseDto>>(this.url(id), dto)
      .pipe(
        map(
          (
            r: ServiceResponse<InsuranceCompanyResponseDto>,
          ): InsuranceCompanyResponseDto => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public list(
    query: GetInsuranceCompaniesQueryDto = {},
    page: HeaderPaginationParams = {},
  ): Observable<PaginateResult<InsuranceCompanyResponseDto>> {
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
      .get<ServiceResponse<PaginateResult<InsuranceCompanyResponseDto>>>(
        this.url(),
        {
          headers,
          params,
        },
      )
      .pipe(
        map(
          (
            r: ServiceResponse<PaginateResult<InsuranceCompanyResponseDto>>,
          ): PaginateResult<InsuranceCompanyResponseDto> => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  private url(...segments: string[]): string {
    return buildUrl(
      this.baseUrl,
      INSURANCE_PATH,
      'insurance-companies',
      ...segments,
    );
  }
}
