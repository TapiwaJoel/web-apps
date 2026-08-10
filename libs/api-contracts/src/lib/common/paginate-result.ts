export interface PaginateResult<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  page?: number;
  totalPages: number;
  hasNextPage: boolean;
  nextPage?: number | null;
  hasPrevPage: boolean;
  prevPage?: number | null;
  pagingCounter: number;
}
