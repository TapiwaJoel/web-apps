import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  CreateStreamDto,
  GetStreamsQueryDto,
  StreamResponseDto,
  UpdateStreamDto,
} from '../dtos';
import {
  API_BASE_URL,
  CONTENT_MANAGEMENT_PATH,
  HeaderPaginationParams,
  PaginateResult,
  ServiceResponse,
  buildPaginationHeaders,
  buildUrl,
  mapHttpError,
} from '../../common';

@Injectable({ providedIn: 'root' })
export class LiveStreamsService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = inject(API_BASE_URL);

  public create(dto: CreateStreamDto): Observable<StreamResponseDto> {
    return this.http
      .post<ServiceResponse<StreamResponseDto>>(this.url(), dto)
      .pipe(
        map(
          (r: ServiceResponse<StreamResponseDto>): StreamResponseDto => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public update(
    id: string,
    dto: UpdateStreamDto,
  ): Observable<StreamResponseDto> {
    return this.http
      .patch<ServiceResponse<StreamResponseDto>>(this.url(id), dto)
      .pipe(
        map(
          (r: ServiceResponse<StreamResponseDto>): StreamResponseDto => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public list(
    query: GetStreamsQueryDto = {},
    page: HeaderPaginationParams = {},
  ): Observable<PaginateResult<StreamResponseDto>> {
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
      .get<ServiceResponse<PaginateResult<StreamResponseDto>>>(this.url(), {
        headers,
        params,
      })
      .pipe(
        map(
          (
            r: ServiceResponse<PaginateResult<StreamResponseDto>>,
          ): PaginateResult<StreamResponseDto> => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  private url(...segments: string[]): string {
    return buildUrl(
      this.baseUrl,
      CONTENT_MANAGEMENT_PATH,
      'live-streams',
      ...segments,
    );
  }
}
