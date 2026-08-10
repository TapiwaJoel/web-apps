import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
  TestRequest,
} from '@angular/common/http/testing';
import { AuditTrailService } from './audit-trail.service';
import { API_BASE_URL } from '../../core';

describe('AuditTrailService', () => {
  let service: AuditTrailService;
  let httpMock: HttpTestingController;
  const BASE: string = 'http://localhost:3000';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: BASE },
        AuditTrailService,
      ],
    });
    service = TestBed.inject(AuditTrailService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('GETs audit-trail/me and unwraps paginated data', () => {
    let result: unknown;
    service.me().subscribe((r) => (result = r));

    const req: TestRequest = httpMock.expectOne(
      `${BASE}/user-management-service/audit-trail/me`,
    );
    expect(req.request.method).toBe('GET');
    req.flush({
      statusCode: 200,
      success: true,
      message: 'ok',
      data: {
        docs: [{ _id: 'a1' }],
        totalDocs: 1,
        limit: 20,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
        pagingCounter: 1,
      },
    });

    expect((result as { docs: unknown[] }).docs).toEqual([{ _id: 'a1' }]);
  });

  it('GETs audit-trail and unwraps paginated data', () => {
    let result: unknown;
    service.list().subscribe((r) => (result = r));

    const req: TestRequest = httpMock.expectOne(
      `${BASE}/user-management-service/audit-trail`,
    );
    expect(req.request.method).toBe('GET');
    req.flush({
      statusCode: 200,
      success: true,
      message: 'ok',
      data: {
        docs: [{ _id: 'a2' }],
        totalDocs: 1,
        limit: 20,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
        pagingCounter: 1,
      },
    });

    expect((result as { docs: unknown[] }).docs).toEqual([{ _id: 'a2' }]);
  });
});
