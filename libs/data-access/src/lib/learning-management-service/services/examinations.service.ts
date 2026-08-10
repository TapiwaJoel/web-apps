import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  CreateExaminationDto,
  ExaminationResponseDto,
  GetExaminationsQueryDto,
  UpdateExaminationDto,
} from '../dtos';
import {
  PaginateResult,
  ServiceResponse,
} from '../../common';
import {
  API_BASE_URL,
  buildUrl,
  LEARNING_MANAGEMENT_PATH,
  mapHttpError,
} from '../../core';

@Injectable({ providedIn: 'root' })
export class ExaminationsService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = inject(API_BASE_URL);

  public create(dto: CreateExaminationDto): Observable<ExaminationResponseDto> {
    return this.http
      .post<ServiceResponse<ExaminationResponseDto>>(this.url(), dto)
      .pipe(
        map((r: ServiceResponse<ExaminationResponseDto>): ExaminationResponseDto => r.data),
        catchError(mapHttpError),
      );
  }

  public update(
    id: string,
    dto: UpdateExaminationDto,
  ): Observable<ExaminationResponseDto> {
    return this.http
      .patch<ServiceResponse<ExaminationResponseDto>>(this.url(id), dto)
      .pipe(
        map((r: ServiceResponse<ExaminationResponseDto>): ExaminationResponseDto => r.data),
        catchError(mapHttpError),
      );
  }

  public list(
    query: GetExaminationsQueryDto = {},
  ): Observable<PaginateResult<ExaminationResponseDto>> {
    let params: HttpParams = new HttpParams();
    (Object.entries(query) as [string, unknown][]).forEach(
      ([key, value]: [string, unknown]): void => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, String(value));
        }
      },
    );
    return this.http
      .get<ServiceResponse<PaginateResult<ExaminationResponseDto>>>(this.url(), {
        params,
      })
      .pipe(
        map(
          (
            r: ServiceResponse<PaginateResult<ExaminationResponseDto>>,
          ): PaginateResult<ExaminationResponseDto> => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  private url(...segments: string[]): string {
    return buildUrl(this.baseUrl, LEARNING_MANAGEMENT_PATH, 'examinations', ...segments);
  }
}
