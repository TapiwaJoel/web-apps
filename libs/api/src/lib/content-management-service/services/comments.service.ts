import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  CommentResponseDto,
  CreateCommentDto,
  GetCommentsQueryDto,
  UpdateCommentDto,
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
export class CommentsService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = inject(API_BASE_URL);

  public create(dto: CreateCommentDto): Observable<CommentResponseDto> {
    return this.http
      .post<ServiceResponse<CommentResponseDto>>(this.url(), dto)
      .pipe(
        map(
          (r: ServiceResponse<CommentResponseDto>): CommentResponseDto =>
            r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public update(
    id: string,
    dto: UpdateCommentDto,
  ): Observable<CommentResponseDto> {
    return this.http
      .patch<ServiceResponse<CommentResponseDto>>(this.url(id), dto)
      .pipe(
        map(
          (r: ServiceResponse<CommentResponseDto>): CommentResponseDto =>
            r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public list(
    query: GetCommentsQueryDto,
    page: HeaderPaginationParams = {},
  ): Observable<PaginateResult<CommentResponseDto>> {
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
      .get<ServiceResponse<PaginateResult<CommentResponseDto>>>(this.url(), {
        headers,
        params,
      })
      .pipe(
        map(
          (
            r: ServiceResponse<PaginateResult<CommentResponseDto>>,
          ): PaginateResult<CommentResponseDto> => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  private url(...segments: string[]): string {
    return buildUrl(
      this.baseUrl,
      CONTENT_MANAGEMENT_PATH,
      'comments',
      ...segments,
    );
  }
}
