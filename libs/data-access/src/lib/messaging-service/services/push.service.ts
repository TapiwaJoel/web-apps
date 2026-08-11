import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  PushNotificationQueueResponseDto,
  SendPushNotificationDto,
} from '../dtos';
import {
  API_BASE_URL,
  MESSAGING_PATH,
  ServiceResponse,
  buildUrl,
  mapHttpError,
} from '../../common';

@Injectable({ providedIn: 'root' })
export class PushService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = inject(API_BASE_URL);

  public send(
    dto: SendPushNotificationDto,
  ): Observable<PushNotificationQueueResponseDto> {
    return this.http
      .post<ServiceResponse<PushNotificationQueueResponseDto>>(
        this.url(),
        dto,
      )
      .pipe(
        map(
          (
            r: ServiceResponse<PushNotificationQueueResponseDto>,
          ): PushNotificationQueueResponseDto => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  private url(...segments: string[]): string {
    return buildUrl(this.baseUrl, MESSAGING_PATH, 'push', ...segments);
  }
}
