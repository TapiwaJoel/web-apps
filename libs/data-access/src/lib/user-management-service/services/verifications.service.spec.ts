import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
  TestRequest,
} from '@angular/common/http/testing';
import { ResendCodeDto, VerifyCodeDto } from '../dtos';
import { VerificationsService } from './verifications.service';
import { API_BASE_URL } from '../../core';

describe('VerificationsService', () => {
  let service: VerificationsService;
  let httpMock: HttpTestingController;
  const BASE: string = 'http://localhost:3000';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: BASE },
        VerificationsService,
      ],
    });
    service = TestBed.inject(VerificationsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('PATCHes verify to verifications/verify and unwraps data', () => {
    let result: unknown;
    const dto: VerifyCodeDto = { verificationId: 'v1', code: '123456' };
    service.verify(dto).subscribe((r) => (result = r));

    const req: TestRequest = httpMock.expectOne(
      `${BASE}/user-management-service/verifications/verify`,
    );
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(dto);
    req.flush({
      statusCode: 200,
      success: true,
      message: 'ok',
      data: { verified: true, verifiedAt: 'now' },
    });

    expect((result as { verified: boolean }).verified).toBe(true);
  });

  it('POSTs resend to verifications/resend and completes with void', () => {
    let result: unknown;
    let completed: boolean = false;
    const dto: ResendCodeDto = { verificationId: 'v1' };
    service.resend(dto).subscribe({
      next: (r) => (result = r),
      complete: () => (completed = true),
    });

    const req: TestRequest = httpMock.expectOne(
      `${BASE}/user-management-service/verifications/resend`,
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush({ statusCode: 200, success: true, message: 'ok', data: null });

    expect(result).toBeUndefined();
    expect(completed).toBe(true);
  });
});
