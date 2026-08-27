import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  CreateDeliveryTariffDto,
  GetDeliveryTariffsQueryDto,
  DeliveryTariffResponseDto,
  UpdateDeliveryTariffDto,
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
export class DeliveryTariffsService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = inject(API_BASE_URL);

  public create(
    dto: CreateDeliveryTariffDto,
  ): Observable<DeliveryTariffResponseDto> {
    return this.http
      .post<ServiceResponse<DeliveryTariffResponseDto>>(this.url(), dto)
      .pipe(
        map(
          (
            r: ServiceResponse<DeliveryTariffResponseDto>,
          ): DeliveryTariffResponseDto => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public update(
    id: string,
    dto: UpdateDeliveryTariffDto,
  ): Observable<DeliveryTariffResponseDto> {
    return this.http
      .patch<ServiceResponse<DeliveryTariffResponseDto>>(this.url(id), dto)
      .pipe(
        map(
          (
            r: ServiceResponse<DeliveryTariffResponseDto>,
          ): DeliveryTariffResponseDto => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public list(
    query: GetDeliveryTariffsQueryDto = {},
    page: HeaderPaginationParams = {},
  ): Observable<PaginateResult<DeliveryTariffResponseDto>> {
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
      .get<ServiceResponse<PaginateResult<DeliveryTariffResponseDto>>>(
        this.url(),
        {
          headers,
          params,
        },
      )
      .pipe(
        map(
          (
            r: ServiceResponse<PaginateResult<DeliveryTariffResponseDto>>,
          ): PaginateResult<DeliveryTariffResponseDto> => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  private url(...segments: string[]): string {
    return buildUrl(
      this.baseUrl,
      INSURANCE_PATH,
      'delivery-tariffs',
      ...segments,
    );
  }
}
