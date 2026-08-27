import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  ComprehensiveRateResponseDto,
  CreateComprehensiveRateDto,
  GetComprehensiveRatesQueryDto,
  UpdateComprehensiveRateDto,
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
export class ComprehensiveRatesService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = inject(API_BASE_URL);

  public create(
    dto: CreateComprehensiveRateDto,
  ): Observable<ComprehensiveRateResponseDto> {
    return this.http
      .post<ServiceResponse<ComprehensiveRateResponseDto>>(this.url(), dto)
      .pipe(
        map(
          (
            r: ServiceResponse<ComprehensiveRateResponseDto>,
          ): ComprehensiveRateResponseDto => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public update(
    id: string,
    dto: UpdateComprehensiveRateDto,
  ): Observable<ComprehensiveRateResponseDto> {
    return this.http
      .patch<ServiceResponse<ComprehensiveRateResponseDto>>(this.url(id), dto)
      .pipe(
        map(
          (
            r: ServiceResponse<ComprehensiveRateResponseDto>,
          ): ComprehensiveRateResponseDto => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public list(
    query: GetComprehensiveRatesQueryDto = {},
    page: HeaderPaginationParams = {},
  ): Observable<PaginateResult<ComprehensiveRateResponseDto>> {
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
      .get<ServiceResponse<PaginateResult<ComprehensiveRateResponseDto>>>(
        this.url(),
        {
          headers,
          params,
        },
      )
      .pipe(
        map(
          (
            r: ServiceResponse<PaginateResult<ComprehensiveRateResponseDto>>,
          ): PaginateResult<ComprehensiveRateResponseDto> => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  private url(...segments: string[]): string {
    return buildUrl(
      this.baseUrl,
      INSURANCE_PATH,
      'comprehensive-rates',
      ...segments,
    );
  }
}
