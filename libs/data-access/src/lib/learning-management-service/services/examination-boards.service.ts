import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  CreateExaminationBoardDto,
  ExaminationBoardResponseDto,
  GetExaminationBoardsQueryDto,
  UpdateExaminationBoardDto,
} from '../dtos';
import {
  API_BASE_URL,
  LEARNING_MANAGEMENT_PATH,
  PaginateResult,
  ServiceResponse,
  buildUrl,
  mapHttpError,
} from '../../common';

@Injectable({ providedIn: 'root' })
export class ExaminationBoardsService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = inject(API_BASE_URL);

  public create(dto: CreateExaminationBoardDto): Observable<ExaminationBoardResponseDto> {
    return this.http
      .post<ServiceResponse<ExaminationBoardResponseDto>>(this.url(), dto)
      .pipe(
        map((r: ServiceResponse<ExaminationBoardResponseDto>): ExaminationBoardResponseDto => r.data),
        catchError(mapHttpError),
      );
  }

  public update(
    id: string,
    dto: UpdateExaminationBoardDto,
  ): Observable<ExaminationBoardResponseDto> {
    return this.http
      .patch<ServiceResponse<ExaminationBoardResponseDto>>(this.url(id), dto)
      .pipe(
        map((r: ServiceResponse<ExaminationBoardResponseDto>): ExaminationBoardResponseDto => r.data),
        catchError(mapHttpError),
      );
  }

  public list(
    query: GetExaminationBoardsQueryDto = {},
  ): Observable<PaginateResult<ExaminationBoardResponseDto>> {
    let params: HttpParams = new HttpParams();
    (Object.entries(query) as [string, unknown][]).forEach(
      ([key, value]: [string, unknown]): void => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, String(value));
        }
      },
    );
    return this.http
      .get<ServiceResponse<PaginateResult<ExaminationBoardResponseDto>>>(this.url(), {
        params,
      })
      .pipe(
        map(
          (
            r: ServiceResponse<PaginateResult<ExaminationBoardResponseDto>>,
          ): PaginateResult<ExaminationBoardResponseDto> => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  private url(...segments: string[]): string {
    return buildUrl(this.baseUrl, LEARNING_MANAGEMENT_PATH, 'examination-boards', ...segments);
  }
}
