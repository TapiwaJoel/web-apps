import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SendSmsDto, SendSmsResponseDto } from '../dtos';
import {
  API_BASE_URL,
  MESSAGING_PATH,
  ServiceResponse,
  buildUrl,
  mapHttpError,
} from '../../common';

@Injectable({ providedIn: 'root' })
export class SmsService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = inject(API_BASE_URL);

  public send(dto: SendSmsDto): Observable<SendSmsResponseDto> {
    return this.http
      .post<ServiceResponse<SendSmsResponseDto>>(this.url('send'), dto)
      .pipe(
        map(
          (r: ServiceResponse<SendSmsResponseDto>): SendSmsResponseDto =>
            r.data,
        ),
        catchError(mapHttpError),
      );
  }

  private url(...segments: string[]): string {
    return buildUrl(this.baseUrl, MESSAGING_PATH, 'sms', ...segments);
  }
}
