import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  AnyResourceResponseDto,
  GetResourceContentQueryDto,
  GetResourcesQueryDto,
} from '../dtos';
import { FileType } from '../enums';
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
export class ResourcesService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = inject(API_BASE_URL);

  public list(
    query: GetResourcesQueryDto = {},
    page: HeaderPaginationParams = {},
  ): Observable<PaginateResult<AnyResourceResponseDto>> {
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
      .get<ServiceResponse<PaginateResult<AnyResourceResponseDto>>>(
        this.url(),
        { headers, params },
      )
      .pipe(
        map(
          (
            r: ServiceResponse<PaginateResult<AnyResourceResponseDto>>,
          ): PaginateResult<AnyResourceResponseDto> => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public remove(type: FileType, filename: string): Observable<void> {
    return this.http
      .delete<ServiceResponse<void>>(
        this.url(type, encodeURIComponent(filename)),
      )
      .pipe(
        map((): void => undefined),
        catchError(mapHttpError),
      );
  }

  public upload(files: File[]): Observable<AnyResourceResponseDto[]> {
    const form: FormData = new FormData();
    files.forEach((f: File): void => {
      form.append('files', f);
    });
    return this.http
      .post<ServiceResponse<AnyResourceResponseDto[]>>(this.url('media'), form)
      .pipe(
        map(
          (
            r: ServiceResponse<AnyResourceResponseDto[]>,
          ): AnyResourceResponseDto[] => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  /**
   * GET /resources/:_id/content — raw file bytes (the endpoint streams the
   * file, it is not wrapped in ServiceResponse).
   */
  public getContent(
    id: string,
    query: GetResourceContentQueryDto = {},
  ): Observable<Blob> {
    return this.http
      .get(this.url(id, 'content'), {
        responseType: 'blob',
        params: this.contentParams(query),
      })
      .pipe(catchError(mapHttpError));
  }

  /**
   * Absolute URL of GET /resources/:_id/content, for use directly as an
   * `<img src>` / `<video src>` / download link (auth travels via cookie).
   */
  public contentUrl(
    id: string,
    query: GetResourceContentQueryDto = {},
  ): string {
    const qs: string = this.contentParams(query).toString();
    const base: string = this.url(id, 'content');
    return qs ? `${base}?${qs}` : base;
  }

  private contentParams(query: GetResourceContentQueryDto): HttpParams {
    let params: HttpParams = new HttpParams();
    if (query.thumbnail !== undefined) {
      params = params.set('thumbnail', String(query.thumbnail));
    }
    if (query.download !== undefined) {
      params = params.set('download', String(query.download));
    }
    return params;
  }

  private url(...segments: string[]): string {
    return buildUrl(
      this.baseUrl,
      CONTENT_MANAGEMENT_PATH,
      'resources',
      ...segments,
    );
  }
}
