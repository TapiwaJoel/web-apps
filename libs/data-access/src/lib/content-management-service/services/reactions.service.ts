import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  AddReactionDto,
  GetReactionCountsQueryDto,
  GetReactionsQueryDto,
  ReactionCountsResponseDto,
  ReactionResponseDto,
  ReactionTypeMetadataDto,
  RemoveReactionDto,
} from '../dtos';
import { ServiceResponse } from '../../common';
import {
  API_BASE_URL,
  buildUrl,
  mapHttpError,
  CONTENT_MANAGEMENT_PATH,
} from '../../core';

@Injectable({ providedIn: 'root' })
export class ReactionsService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = inject(API_BASE_URL);

  public addOrToggle(
    dto: AddReactionDto,
  ): Observable<ReactionResponseDto | null> {
    return this.http
      .post<ServiceResponse<ReactionResponseDto | null>>(this.url(), dto)
      .pipe(
        map(
          (
            r: ServiceResponse<ReactionResponseDto | null>,
          ): ReactionResponseDto | null => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public remove(dto: RemoveReactionDto): Observable<null> {
    return this.http
      .delete<ServiceResponse<null>>(this.url(), { body: dto })
      .pipe(
        map((r: ServiceResponse<null>): null => r.data),
        catchError(mapHttpError),
      );
  }

  public types(): Observable<ReactionTypeMetadataDto[]> {
    return this.http
      .get<ServiceResponse<ReactionTypeMetadataDto[]>>(this.url('types'))
      .pipe(
        map(
          (
            r: ServiceResponse<ReactionTypeMetadataDto[]>,
          ): ReactionTypeMetadataDto[] => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public list(
    query: GetReactionsQueryDto,
  ): Observable<ReactionResponseDto[]> {
    let params: HttpParams = new HttpParams();
    (Object.entries(query) as [string, unknown][]).forEach(
      ([key, value]: [string, unknown]): void => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, String(value));
        }
      },
    );
    return this.http
      .get<ServiceResponse<ReactionResponseDto[]>>(this.url(), { params })
      .pipe(
        map(
          (r: ServiceResponse<ReactionResponseDto[]>): ReactionResponseDto[] =>
            r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public counts(
    query: GetReactionCountsQueryDto,
  ): Observable<ReactionCountsResponseDto> {
    let params: HttpParams = new HttpParams();
    (Object.entries(query) as [string, unknown][]).forEach(
      ([key, value]: [string, unknown]): void => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, String(value));
        }
      },
    );
    return this.http
      .get<ServiceResponse<ReactionCountsResponseDto>>(this.url('counts'), {
        params,
      })
      .pipe(
        map(
          (
            r: ServiceResponse<ReactionCountsResponseDto>,
          ): ReactionCountsResponseDto => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  private url(...segments: string[]): string {
    return buildUrl(
      this.baseUrl,
      CONTENT_MANAGEMENT_PATH,
      'reactions',
      ...segments,
    );
  }
}
