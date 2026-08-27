import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  CreateDeliveryAddressDto,
  GetDeliveryAddressesQueryDto,
  DeliveryAddressResponseDto,
  UpdateDeliveryAddressDto,
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
export class DeliveryAddressesService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = inject(API_BASE_URL);

  public create(
    dto: CreateDeliveryAddressDto,
  ): Observable<DeliveryAddressResponseDto> {
    return this.http
      .post<ServiceResponse<DeliveryAddressResponseDto>>(this.url(), dto)
      .pipe(
        map(
          (
            r: ServiceResponse<DeliveryAddressResponseDto>,
          ): DeliveryAddressResponseDto => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public update(
    id: string,
    dto: UpdateDeliveryAddressDto,
  ): Observable<DeliveryAddressResponseDto> {
    return this.http
      .patch<ServiceResponse<DeliveryAddressResponseDto>>(this.url(id), dto)
      .pipe(
        map(
          (
            r: ServiceResponse<DeliveryAddressResponseDto>,
          ): DeliveryAddressResponseDto => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public list(
    query: GetDeliveryAddressesQueryDto = {},
    page: HeaderPaginationParams = {},
  ): Observable<PaginateResult<DeliveryAddressResponseDto>> {
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
      .get<ServiceResponse<PaginateResult<DeliveryAddressResponseDto>>>(
        this.url(),
        {
          headers,
          params,
        },
      )
      .pipe(
        map(
          (
            r: ServiceResponse<PaginateResult<DeliveryAddressResponseDto>>,
          ): PaginateResult<DeliveryAddressResponseDto> => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  private url(...segments: string[]): string {
    return buildUrl(
      this.baseUrl,
      INSURANCE_PATH,
      'delivery-addresses',
      ...segments,
    );
  }
}
