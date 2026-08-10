import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  ContentProgressResponseDto,
  CreateBookmarkDto,
  CreateContentProgressDto,
  GetContentProgressQueryDto,
  UpdateContentProgressDto,
} from '../dtos';
import { PaginateResult, ServiceResponse } from '../../common';
import {
  API_BASE_URL,
  buildPaginationHeaders,
  buildUrl,
  HeaderPaginationParams,
  mapHttpError,
  CONTENT_MANAGEMENT_PATH,
} from '../../core';

@Injectable({ providedIn: 'root' })
export class ContentProgressService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = inject(API_BASE_URL);

  public create(
    dto: CreateContentProgressDto,
  ): Observable<ContentProgressResponseDto> {
    return this.http
      .post<ServiceResponse<ContentProgressResponseDto>>(this.url(), dto)
      .pipe(
        map(
          (
            r: ServiceResponse<ContentProgressResponseDto>,
          ): ContentProgressResponseDto => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public list(
    query: GetContentProgressQueryDto = {},
    page: HeaderPaginationParams = {},
  ): Observable<PaginateResult<ContentProgressResponseDto>> {
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
      .get<ServiceResponse<PaginateResult<ContentProgressResponseDto>>>(
        this.url(),
        { headers, params },
      )
      .pipe(
        map(
          (
            r: ServiceResponse<PaginateResult<ContentProgressResponseDto>>,
          ): PaginateResult<ContentProgressResponseDto> => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public update(
    contentId: string,
    systemUserId: string,
    dto: UpdateContentProgressDto,
  ): Observable<ContentProgressResponseDto> {
    return this.http
      .patch<ServiceResponse<ContentProgressResponseDto>>(
        this.url(contentId, systemUserId),
        dto,
      )
      .pipe(
        map(
          (
            r: ServiceResponse<ContentProgressResponseDto>,
          ): ContentProgressResponseDto => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public remove(progressId: string): Observable<void> {
    return this.http
      .delete<ServiceResponse<void>>(this.url(progressId))
      .pipe(
        map((): void => undefined),
        catchError(mapHttpError),
      );
  }

  public addBookmark(
    progressId: string,
    dto: CreateBookmarkDto,
  ): Observable<ContentProgressResponseDto> {
    return this.http
      .post<ServiceResponse<ContentProgressResponseDto>>(
        this.url(progressId, 'bookmarks'),
        dto,
      )
      .pipe(
        map(
          (
            r: ServiceResponse<ContentProgressResponseDto>,
          ): ContentProgressResponseDto => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public removeBookmark(
    progressId: string,
    position: number,
  ): Observable<ContentProgressResponseDto> {
    return this.http
      .delete<ServiceResponse<ContentProgressResponseDto>>(
        this.url(progressId, 'bookmarks', String(position)),
      )
      .pipe(
        map(
          (
            r: ServiceResponse<ContentProgressResponseDto>,
          ): ContentProgressResponseDto => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  private url(...segments: string[]): string {
    return buildUrl(
      this.baseUrl,
      CONTENT_MANAGEMENT_PATH,
      'content-progress',
      ...segments,
    );
  }
}
