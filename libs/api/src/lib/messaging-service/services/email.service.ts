import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SendEmailResponseDto, SendNotificationDto } from '../dtos';
import {
  API_BASE_URL,
  MESSAGING_PATH,
  ServiceResponse,
  buildUrl,
  mapHttpError,
} from '../../common';

@Injectable({ providedIn: 'root' })
export class EmailService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = inject(API_BASE_URL);

  public send(
    dto: SendNotificationDto,
    attachments?: File[],
  ): Observable<SendEmailResponseDto> {
    const form: FormData = new FormData();
    form.append('to', dto.to);
    form.append('notificationType', dto.notificationType);
    form.append('context', JSON.stringify(dto.context));
    (attachments ?? []).forEach((f: File): void => {
      form.append('attachments', f);
    });
    return this.http
      .post<ServiceResponse<SendEmailResponseDto>>(this.url(), form)
      .pipe(
        map(
          (r: ServiceResponse<SendEmailResponseDto>): SendEmailResponseDto =>
            r.data,
        ),
        catchError(mapHttpError),
      );
  }

  private url(...segments: string[]): string {
    return buildUrl(this.baseUrl, MESSAGING_PATH, 'email', ...segments);
  }
}
