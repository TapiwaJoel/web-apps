import { ServiceResponse, PaginateResult } from './index';

describe('common envelope types', () => {
  it('constructs a ServiceResponse<PaginateResult<T>>', () => {
    const resp: ServiceResponse<PaginateResult<{ id: string }>> = {
      statusCode: 200,
      success: true,
      message: 'ok',
      data: {
        docs: [{ id: 'a' }],
        totalDocs: 1,
        limit: 20,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
        pagingCounter: 1,
      },
    };
    expect(resp.data.docs[0].id).toBe('a');
    expect(resp.success).toBe(true);
  });
});
