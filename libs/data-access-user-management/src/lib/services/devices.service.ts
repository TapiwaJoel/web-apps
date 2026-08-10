import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  DeviceResponseDto,
  PaginateResult,
  ServiceResponse,
} from '@mushaviri/api-contracts';
import {
  API_BASE_URL,
  buildUrl,
  mapHttpError,
  USER_MANAGEMENT_PATH,
} from '../core';

@Injectable({ providedIn: 'root' })
export class DevicesService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = inject(API_BASE_URL);

  public list(): Observable<PaginateResult<DeviceResponseDto>> {
    return this.http
      .get<ServiceResponse<PaginateResult<DeviceResponseDto>>>(this.url())
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
          (
            r: ServiceResponse<DeviceResponseDto>,
          ): DeviceResponseDto => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  private url(...segments: string[]): string {
    return buildUrl(
      this.baseUrl,
      USER_MANAGEMENT_PATH,
      'devices',
      ...segments,
    );
  }
}
