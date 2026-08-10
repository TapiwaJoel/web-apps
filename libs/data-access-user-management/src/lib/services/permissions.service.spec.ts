import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
  TestRequest,
} from '@angular/common/http/testing';
import {
  Action,
  CreatePermissionDto,
  UpdatePermissionDto,
} from '@mushaviri/api-contracts';
import { PermissionsService } from './permissions.service';
import { API_BASE_URL } from '../core';

describe('PermissionsService', () => {
  let service: PermissionsService;
  let httpMock: HttpTestingController;
  const BASE: string = 'http://localhost:3000';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: BASE },
        PermissionsService,
      ],
    });
    service = TestBed.inject(PermissionsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('POSTs create to permissions and unwraps data', () => {
    let result: unknown;
    const dto: CreatePermissionDto = {
      name: 'users.create',
      serviceName: 'user-management-service',
      resource: 'users',
      action: Action.CREATE,
      description: 'Create users',
    };
    service.create(dto).subscribe((r) => (result = r));

    const req: TestRequest = httpMock.expectOne(
      `${BASE}/user-management-service/permissions`,
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush({
      statusCode: 201,
      success: true,
      message: 'ok',
      data: { _id: 'p1', name: 'users.create' },
    });

    expect((result as { _id: string })._id).toBe('p1');
  });

  it('PATCHes update to permissions/:id and unwraps data', () => {
    let result: unknown;
    const dto: UpdatePermissionDto = { description: 'Updated description' };
    service.update('p1', dto).subscribe((r) => (result = r));

    const req: TestRequest = httpMock.expectOne(
      `${BASE}/user-management-service/permissions/p1`,
    );
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(dto);
    req.flush({
      statusCode: 200,
      success: true,
      message: 'ok',
      data: { _id: 'p1', description: 'Updated description' },
    });

    expect((result as { description: string }).description).toBe(
      'Updated description',
    );
  });

  it('GETs permissions and unwraps paginated data', () => {
    let result: unknown;
    service.list().subscribe((r) => (result = r));

    const req: TestRequest = httpMock.expectOne(
      `${BASE}/user-management-service/permissions`,
    );
    expect(req.request.method).toBe('GET');
    req.flush({
      statusCode: 200,
      success: true,
      message: 'ok',
      data: {
        docs: [{ _id: 'p1' }],
        totalDocs: 1,
        limit: 20,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
        pagingCounter: 1,
      },
    });

    expect((result as { docs: unknown[] }).docs).toEqual([{ _id: 'p1' }]);
  });
});
