import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DeviceResponseDto } from '../dtos';
import {
  API_BASE_URL,
  PaginateResult,
  ServiceResponse,
  USER_MANAGEMENT_PATH,
  buildUrl,
  mapHttpError,
} from '../../common';

export interface DevicesQuery {
  _id?: string;
  systemUser?: string;
  deviceType?: string;
  deviceId?: string;
  name?: string;
  platform?: string;
  isActive?: boolean;
}

@Injectable({ providedIn: 'root' })
export class DevicesService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = inject(API_BASE_URL);

  public list(
    query: DevicesQuery = {},
  ): Observable<PaginateResult<DeviceResponseDto>> {
    let params: HttpParams = new HttpParams();
    (Object.entries(query) as [string, unknown][]).forEach(
      ([key, value]: [string, unknown]): void => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, String(value));
        }
      },
    );
    return this.http
      .get<ServiceResponse<PaginateResult<DeviceResponseDto>>>(this.url(), {
        params,
      })
      .pipe(
        map(
          (
            r: ServiceResponse<PaginateResult<DeviceResponseDto>>,
          ): PaginateResult<DeviceResponseDto> => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public update(
    deviceId: string,
    body: Partial<DeviceResponseDto>,
  ): Observable<DeviceResponseDto> {
    return this.http
      .patch<ServiceResponse<DeviceResponseDto>>(this.url(deviceId), body)
      .pipe(
        map(
          (r: ServiceResponse<DeviceResponseDto>): DeviceResponseDto => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  private url(...segments: string[]): string {
    return buildUrl(this.baseUrl, USER_MANAGEMENT_PATH, 'devices', ...segments);
  }
}
