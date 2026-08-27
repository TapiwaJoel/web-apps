import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  CreateInsuranceCoverageTypeDto,
  GetInsuranceCoverageTypesQueryDto,
  InsuranceCoverageTypeResponseDto,
  UpdateInsuranceCoverageTypeDto,
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
export class InsuranceCoverageTypesService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = inject(API_BASE_URL);

  public create(
    dto: CreateInsuranceCoverageTypeDto,
  ): Observable<InsuranceCoverageTypeResponseDto> {
    return this.http
      .post<ServiceResponse<InsuranceCoverageTypeResponseDto>>(this.url(), dto)
      .pipe(
        map(
          (
            r: ServiceResponse<InsuranceCoverageTypeResponseDto>,
          ): InsuranceCoverageTypeResponseDto => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public update(
    id: string,
    dto: UpdateInsuranceCoverageTypeDto,
  ): Observable<InsuranceCoverageTypeResponseDto> {
    return this.http
      .patch<ServiceResponse<InsuranceCoverageTypeResponseDto>>(
        this.url(id),
        dto,
      )
      .pipe(
        map(
          (
            r: ServiceResponse<InsuranceCoverageTypeResponseDto>,
          ): InsuranceCoverageTypeResponseDto => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public list(
    query: GetInsuranceCoverageTypesQueryDto = {},
    page: HeaderPaginationParams = {},
  ): Observable<PaginateResult<InsuranceCoverageTypeResponseDto>> {
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
      .get<ServiceResponse<PaginateResult<InsuranceCoverageTypeResponseDto>>>(
        this.url(),
        {
          headers,
          params,
        },
      )
      .pipe(
        map(
          (
            r: ServiceResponse<
              PaginateResult<InsuranceCoverageTypeResponseDto>
            >,
          ): PaginateResult<InsuranceCoverageTypeResponseDto> => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  private url(...segments: string[]): string {
    return buildUrl(
      this.baseUrl,
      INSURANCE_PATH,
      'insurance-coverage-types',
      ...segments,
    );
  }
}
