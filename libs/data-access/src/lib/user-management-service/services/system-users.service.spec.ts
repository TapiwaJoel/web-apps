import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
  TestRequest,
} from '@angular/common/http/testing';
import { CreateSystemUserDto } from '../dtos';
import { SystemUsersService } from './system-users.service';
import { API_BASE_URL } from '../../core';

describe('SystemUsersService', () => {
  let service: SystemUsersService;
  let httpMock: HttpTestingController;
  const BASE: string = 'http://localhost:3000';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: BASE },
        SystemUsersService,
      ],
    });
    service = TestBed.inject(SystemUsersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('POSTs create to system-users and unwraps data', () => {
    let result: unknown;
    const dto: CreateSystemUserDto = {
      name: 'Sam',
      phoneNumber: '+263771234567',
      emailAddress: 'sam@example.com',
      country: 'ZW',
      role: 'role-1',
    };
    service.create(dto).subscribe((r) => (result = r));

    const req: TestRequest = httpMock.expectOne(
      `${BASE}/user-management-service/system-users`,
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush({
      statusCode: 201,
      success: true,
      message: 'ok',
      data: { _id: 'su1', name: 'Sam' },
    });

    expect((result as { _id: string })._id).toBe('su1');
  });

  it('PATCHes update to system-users/:systemUserId and unwraps data', () => {
    let result: unknown;
    const dto: Partial<CreateSystemUserDto> = { name: 'Sam Updated' };
    service.update('su1', dto).subscribe((r) => (result = r));

    const req: TestRequest = httpMock.expectOne(
      `${BASE}/user-management-service/system-users/su1`,
    );
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(dto);
    req.flush({
      statusCode: 200,
      success: true,
      message: 'ok',
      data: { _id: 'su1', name: 'Sam Updated' },
    });

    expect((result as { name: string }).name).toBe('Sam Updated');
  });

  it('GETs system-users with only defined query params', () => {
    let result: unknown;
    service.list({ page: 2, limit: 10 }).subscribe((r) => (result = r));

    const req: TestRequest = httpMock.expectOne(
      (r) => r.url === `${BASE}/user-management-service/system-users`,
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('limit')).toBe('10');
    req.flush({
      statusCode: 200,
      success: true,
      message: 'ok',
      data: {
        docs: [{ _id: 'su1' }],
        totalDocs: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
        pagingCounter: 1,
      },
    });

    expect((result as { docs: unknown[] }).docs).toEqual([{ _id: 'su1' }]);
  });

  it('GETs system-users with no params when list() called with defaults', () => {
    service.list().subscribe();
    const req: TestRequest = httpMock.expectOne(
      (r) => r.url === `${BASE}/user-management-service/system-users`,
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.params.keys().length).toBe(0);
    req.flush({
      statusCode: 200,
      success: true,
      message: 'ok',
      data: {
        docs: [],
        totalDocs: 0,
        limit: 20,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
        pagingCounter: 0,
      },
    });
  });
});
