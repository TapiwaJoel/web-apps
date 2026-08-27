import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  CreateRiderDto,
  GetRidersQueryDto,
  RiderResponseDto,
  UpdateRiderDto,
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
export class RidersService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = inject(API_BASE_URL);

  public create(dto: CreateRiderDto): Observable<RiderResponseDto> {
    return this.http
      .post<ServiceResponse<RiderResponseDto>>(this.url(), dto)
      .pipe(
        map((r: ServiceResponse<RiderResponseDto>): RiderResponseDto => r.data),
        catchError(mapHttpError),
      );
  }

  public update(id: string, dto: UpdateRiderDto): Observable<RiderResponseDto> {
    return this.http
      .patch<ServiceResponse<RiderResponseDto>>(this.url(id), dto)
      .pipe(
        map((r: ServiceResponse<RiderResponseDto>): RiderResponseDto => r.data),
        catchError(mapHttpError),
      );
  }

  public list(
    query: GetRidersQueryDto = {},
    page: HeaderPaginationParams = {},
  ): Observable<PaginateResult<RiderResponseDto>> {
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
      .get<ServiceResponse<PaginateResult<RiderResponseDto>>>(this.url(), {
        headers,
        params,
      })
      .pipe(
        map(
          (
            r: ServiceResponse<PaginateResult<RiderResponseDto>>,
          ): PaginateResult<RiderResponseDto> => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  private url(...segments: string[]): string {
    return buildUrl(this.baseUrl, INSURANCE_PATH, 'riders', ...segments);
  }
}
