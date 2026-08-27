import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  CreatePartnerDto,
  GetPartnersQueryDto,
  PartnerResponseDto,
  UpdatePartnerDto,
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
export class PartnersService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = inject(API_BASE_URL);

  public create(dto: CreatePartnerDto): Observable<PartnerResponseDto> {
    return this.http
      .post<ServiceResponse<PartnerResponseDto>>(this.url(), dto)
      .pipe(
        map(
          (r: ServiceResponse<PartnerResponseDto>): PartnerResponseDto =>
            r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public update(
    id: string,
    dto: UpdatePartnerDto,
  ): Observable<PartnerResponseDto> {
    return this.http
      .patch<ServiceResponse<PartnerResponseDto>>(this.url(id), dto)
      .pipe(
        map(
          (r: ServiceResponse<PartnerResponseDto>): PartnerResponseDto =>
            r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public list(
    query: GetPartnersQueryDto = {},
    page: HeaderPaginationParams = {},
  ): Observable<PaginateResult<PartnerResponseDto>> {
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
      .get<ServiceResponse<PaginateResult<PartnerResponseDto>>>(this.url(), {
        headers,
        params,
      })
      .pipe(
        map(
          (
            r: ServiceResponse<PaginateResult<PartnerResponseDto>>,
          ): PaginateResult<PartnerResponseDto> => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  private url(...segments: string[]): string {
    return buildUrl(this.baseUrl, INSURANCE_PATH, 'partners', ...segments);
  }
}
