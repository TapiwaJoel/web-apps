import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
  TestRequest,
} from '@angular/common/http/testing';
import { CreateRolePermissionDto } from '@mushaviri/api-contracts';
import { RolePermissionsService } from './role-permissions.service';
import { API_BASE_URL } from '../core';

describe('RolePermissionsService', () => {
  let service: RolePermissionsService;
  let httpMock: HttpTestingController;
  const BASE: string = 'http://localhost:3000';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: BASE },
        RolePermissionsService,
      ],
    });
    service = TestBed.inject(RolePermissionsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('POSTs create to role-permissions and unwraps data', () => {
    let result: unknown;
    const dto: CreateRolePermissionDto = {
      roleId: 'role-1',
      permissionId: 'perm-1',
    };
    service.create(dto).subscribe((r) => (result = r));

    const req: TestRequest = httpMock.expectOne(
      `${BASE}/user-management-service/role-permissions`,
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush({
      statusCode: 201,
      success: true,
      message: 'ok',
      data: { _id: 'rp1', roleId: 'role-1', permissionId: 'perm-1' },
    });

    expect((result as { _id: string })._id).toBe('rp1');
  });

  it('PATCHes update to role-permissions/:id and unwraps data', () => {
    let result: unknown;
    const dto: Partial<CreateRolePermissionDto> = { status: 'Active' };
    service.update('rp1', dto).subscribe((r) => (result = r));

    const req: TestRequest = httpMock.expectOne(
      `${BASE}/user-management-service/role-permissions/rp1`,
    );
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(dto);
    req.flush({
      statusCode: 200,
      success: true,
      message: 'ok',
      data: { _id: 'rp1', status: 'Active' },
    });

    expect((result as { status: string }).status).toBe('Active');
  });

  it('GETs role-permissions and unwraps paginated data', () => {
    let result: unknown;
    service.list().subscribe((r) => (result = r));

    const req: TestRequest = httpMock.expectOne(
      `${BASE}/user-management-service/role-permissions`,
    );
    expect(req.request.method).toBe('GET');
    req.flush({
      statusCode: 200,
      success: true,
      message: 'ok',
      data: {
        docs: [{ _id: 'rp1' }],
        totalDocs: 1,
        limit: 20,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
        pagingCounter: 1,
      },
    });

    expect((result as { docs: unknown[] }).docs).toEqual([{ _id: 'rp1' }]);
  });
});
