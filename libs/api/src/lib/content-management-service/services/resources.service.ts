import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  DocumentResourceResponseDto,
  GetResourcesQueryDto,
  MediaResourceResponseDto,
  ResourceResponseDto,
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

type AnyResourceResponseDto = ResourceResponseDto<
  MediaResourceResponseDto | DocumentResourceResponseDto
>;

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

  public remove(type: string, filename: string): Observable<void> {
    return this.http
      .delete<ServiceResponse<void>>(this.url(type, filename))
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

  public getContent(
    id: string,
    opts: { thumbnail?: boolean; download?: boolean } = {},
  ): Observable<Blob> {
    let params: HttpParams = new HttpParams();
    if (opts.thumbnail !== undefined) {
      params = params.set('thumbnail', String(opts.thumbnail));
    }
    if (opts.download !== undefined) {
      params = params.set('download', String(opts.download));
    }
    return this.http
      .get(this.url(id, 'content'), { responseType: 'blob', params })
      .pipe(catchError(mapHttpError));
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
