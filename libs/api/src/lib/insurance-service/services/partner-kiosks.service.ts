import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  CreatePartnerKioskDto,
  GetPartnerKiosksQueryDto,
  PartnerKioskResponseDto,
  UpdatePartnerKioskDto,
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
export class PartnerKiosksService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = inject(API_BASE_URL);

  public create(
    dto: CreatePartnerKioskDto,
  ): Observable<PartnerKioskResponseDto> {
    return this.http
      .post<ServiceResponse<PartnerKioskResponseDto>>(this.url(), dto)
      .pipe(
        map(
          (
            r: ServiceResponse<PartnerKioskResponseDto>,
          ): PartnerKioskResponseDto => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public update(
    id: string,
    dto: UpdatePartnerKioskDto,
  ): Observable<PartnerKioskResponseDto> {
    return this.http
      .patch<ServiceResponse<PartnerKioskResponseDto>>(this.url(id), dto)
      .pipe(
        map(
          (
            r: ServiceResponse<PartnerKioskResponseDto>,
          ): PartnerKioskResponseDto => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public list(
    query: GetPartnerKiosksQueryDto = {},
    page: HeaderPaginationParams = {},
  ): Observable<PaginateResult<PartnerKioskResponseDto>> {
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
      .get<ServiceResponse<PaginateResult<PartnerKioskResponseDto>>>(
        this.url(),
        {
          headers,
          params,
        },
      )
      .pipe(
        map(
          (
            r: ServiceResponse<PaginateResult<PartnerKioskResponseDto>>,
          ): PaginateResult<PartnerKioskResponseDto> => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  private url(...segments: string[]): string {
    return buildUrl(
      this.baseUrl,
      INSURANCE_PATH,
      'partner-kiosks',
      ...segments,
    );
  }
}
