import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  AssignFulfilmentJobDto,
  ConfirmPrintDto,
  FulfilmentJobResponseDto,
  FulfilmentReportRowResponseDto,
  GetFulfilmentJobsQueryDto,
  GetFulfilmentReportQueryDto,
  GetMyFulfilmentJobsQueryDto,
  GetStuckFulfilmentJobsQueryDto,
  MyFulfilmentSummaryResponseDto,
  ReportArrivalDto,
  VerifyHandoverDto,
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
export class FulfilmentJobsService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = inject(API_BASE_URL);

  public list(
    query: GetFulfilmentJobsQueryDto = {},
    page: HeaderPaginationParams = {},
  ): Observable<PaginateResult<FulfilmentJobResponseDto>> {
    const params: HttpParams = this.toParams(query);
    const headers: HttpHeaders = buildPaginationHeaders(page);
    return this.http
      .get<ServiceResponse<PaginateResult<FulfilmentJobResponseDto>>>(
        this.url('fulfilments', 'jobs'),
        { headers, params },
      )
      .pipe(
        map(
          (
            r: ServiceResponse<PaginateResult<FulfilmentJobResponseDto>>,
          ): PaginateResult<FulfilmentJobResponseDto> => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public get(id: string): Observable<FulfilmentJobResponseDto> {
    return this.http
      .get<ServiceResponse<FulfilmentJobResponseDto>>(
        this.url('fulfilments', 'jobs', id),
      )
      .pipe(
        map(
          (
            r: ServiceResponse<FulfilmentJobResponseDto>,
          ): FulfilmentJobResponseDto => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public listMine(
    query: GetMyFulfilmentJobsQueryDto = {},
    page: HeaderPaginationParams = {},
  ): Observable<PaginateResult<FulfilmentJobResponseDto>> {
    const params: HttpParams = this.toParams(query);
    const headers: HttpHeaders = buildPaginationHeaders(page);
    return this.http
      .get<ServiceResponse<PaginateResult<FulfilmentJobResponseDto>>>(
        this.url('fulfilments', 'jobs', 'mine'),
        { headers, params },
      )
      .pipe(
        map(
          (
            r: ServiceResponse<PaginateResult<FulfilmentJobResponseDto>>,
          ): PaginateResult<FulfilmentJobResponseDto> => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public myActive(): Observable<FulfilmentJobResponseDto | null> {
    return this.http
      .get<ServiceResponse<FulfilmentJobResponseDto | null>>(
        this.url('fulfilments', 'jobs', 'mine', 'active'),
      )
      .pipe(
        map(
          (
            r: ServiceResponse<FulfilmentJobResponseDto | null>,
          ): FulfilmentJobResponseDto | null => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public mySummary(): Observable<MyFulfilmentSummaryResponseDto> {
    return this.http
      .get<ServiceResponse<MyFulfilmentSummaryResponseDto>>(
        this.url('fulfilments', 'jobs', 'mine', 'summary'),
      )
      .pipe(
        map(
          (
            r: ServiceResponse<MyFulfilmentSummaryResponseDto>,
          ): MyFulfilmentSummaryResponseDto => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public stuck(
    query: GetStuckFulfilmentJobsQueryDto = {},
  ): Observable<FulfilmentJobResponseDto[]> {
    const params: HttpParams = this.toParams(query);
    return this.http
      .get<ServiceResponse<FulfilmentJobResponseDto[]>>(
        this.url('fulfilments', 'jobs', 'stuck'),
        { params },
      )
      .pipe(
        map(
          (
            r: ServiceResponse<FulfilmentJobResponseDto[]>,
          ): FulfilmentJobResponseDto[] => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public report(
    query: GetFulfilmentReportQueryDto = {},
  ): Observable<FulfilmentReportRowResponseDto[]> {
    const params: HttpParams = this.toParams(query);
    return this.http
      .get<ServiceResponse<FulfilmentReportRowResponseDto[]>>(
        this.url('fulfilments', 'jobs', 'reports', 'summary'),
        { params },
      )
      .pipe(
        map(
          (
            r: ServiceResponse<FulfilmentReportRowResponseDto[]>,
          ): FulfilmentReportRowResponseDto[] => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public assign(
    id: string,
    dto: AssignFulfilmentJobDto,
  ): Observable<FulfilmentJobResponseDto> {
    return this.post(this.url('fulfilments', 'jobs', id, 'assign'), dto);
  }

  public arrive(
    id: string,
    dto: ReportArrivalDto,
  ): Observable<FulfilmentJobResponseDto> {
    return this.post(this.url('fulfilments', 'jobs', id, 'arrive'), dto);
  }

  public confirmPrint(
    id: string,
    dto: ConfirmPrintDto,
  ): Observable<FulfilmentJobResponseDto> {
    return this.post(this.url('fulfilments', 'jobs', id, 'print'), dto);
  }

  public collect(
    id: string,
    dto: VerifyHandoverDto,
  ): Observable<FulfilmentJobResponseDto> {
    return this.post(this.url('fulfilments', 'jobs', id, 'collect'), dto);
  }

  public deliver(
    id: string,
    dto: VerifyHandoverDto,
  ): Observable<FulfilmentJobResponseDto> {
    return this.post(this.url('fulfilments', 'jobs', id, 'deliver'), dto);
  }

  public completePickup(
    id: string,
    dto: VerifyHandoverDto,
  ): Observable<FulfilmentJobResponseDto> {
    return this.post(
      this.url('fulfilments', 'jobs', id, 'complete-pickup'),
      dto,
    );
  }

  private post(
    url: string,
    dto: unknown,
  ): Observable<FulfilmentJobResponseDto> {
    return this.http
      .post<ServiceResponse<FulfilmentJobResponseDto>>(url, dto)
      .pipe(
        map(
          (
            r: ServiceResponse<FulfilmentJobResponseDto>,
          ): FulfilmentJobResponseDto => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  private toParams(query: object): HttpParams {
    let params: HttpParams = new HttpParams();
    (Object.entries(query) as [string, unknown][]).forEach(
      ([key, value]: [string, unknown]): void => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, String(value));
        }
      },
    );
    return params;
  }

  private url(...segments: string[]): string {
    return buildUrl(this.baseUrl, INSURANCE_PATH, ...segments);
  }
}
