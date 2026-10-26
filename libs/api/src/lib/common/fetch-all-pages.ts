import { EMPTY, expand, map, Observable, reduce } from 'rxjs';
import { HeaderPaginationParams } from './build-pagination-headers';
import { PaginateResult } from './paginate-result';

/** The backend's maximum page size (`base.repository.ts` caps `limit` at 100). */
export const MAX_PAGE_LIMIT: number = 100;

/** The backend rejects `X-Page` above 10000 (`pagination.utils.ts`). */
const MAX_PAGE_NUMBER: number = 10000;

interface FetchedPage<R> {
  page: number;
  result: R;
}

/**
 * Fetch every page of a header-paginated endpoint whose response carries a
 * `hasNextPage` flag, requesting pages of {@link MAX_PAGE_LIMIT} until the
 * backend reports no next page, and emit all items concatenated in order.
 *
 * `selectItems` picks the items out of each page's response, for endpoints
 * whose list response isn't a plain {@link PaginateResult} (e.g.
 * `{ subscriptions, hasNextPage, ... }`).
 */
export function fetchAllPagesBy<
  R extends { hasNextPage: boolean; page?: number },
  T,
>(
  fetchPage: (page: HeaderPaginationParams) => Observable<R>,
  selectItems: (result: R) => T[],
): Observable<T[]> {
  const fetchNumbered: (page: number) => Observable<FetchedPage<R>> = (
    page: number,
  ): Observable<FetchedPage<R>> =>
    fetchPage({ page, limit: MAX_PAGE_LIMIT }).pipe(
      map((result: R): FetchedPage<R> => ({ page, result })),
    );

  return fetchNumbered(1).pipe(
    expand((fetched: FetchedPage<R>): Observable<FetchedPage<R>> =>
      // Stop on an empty page, a page cap, or a response for a different page than
      // requested. The last guards against cached list endpoints (e.g. CMS
      // `GET /resources` sets `Cache-Control: public` without `Vary: X-Page`), where
      // the browser can answer page N with cached page 1 forever.
      fetched.result.hasNextPage &&
      selectItems(fetched.result).length > 0 &&
      (fetched.result.page ?? fetched.page) === fetched.page &&
      fetched.page < MAX_PAGE_NUMBER
        ? fetchNumbered(fetched.page + 1)
        : EMPTY,
    ),
    reduce(
      (all: T[], fetched: FetchedPage<R>): T[] =>
        all.concat(selectItems(fetched.result)),
      [] as T[],
    ),
  );
}

/**
 * Fetch every page of a header-paginated endpoint returning a
 * {@link PaginateResult}, and emit all `docs` concatenated in order.
 */
export function fetchAllPages<T>(
  fetchPage: (page: HeaderPaginationParams) => Observable<PaginateResult<T>>,
): Observable<T[]> {
  return fetchAllPagesBy(
    fetchPage,
    (result: PaginateResult<T>): T[] => result.docs,
  );
}

/**
 * Fetch every page of an endpoint paginated by `limit`/`offset` query params,
 * requesting pages of {@link MAX_PAGE_LIMIT} until one comes back short, and
 * emit all items concatenated in order.
 */
export function fetchAllOffsetPages<T>(
  fetchPage: (limit: number, offset: number) => Observable<T[]>,
): Observable<T[]> {
  interface OffsetPage {
    offset: number;
    items: T[];
  }
  const fetchAt: (offset: number) => Observable<OffsetPage> = (
    offset: number,
  ): Observable<OffsetPage> =>
    fetchPage(MAX_PAGE_LIMIT, offset).pipe(
      map((items: T[]): OffsetPage => ({ offset, items })),
    );

  return fetchAt(0).pipe(
    expand((fetched: OffsetPage): Observable<OffsetPage> =>
      fetched.items.length >= MAX_PAGE_LIMIT
        ? fetchAt(fetched.offset + MAX_PAGE_LIMIT)
        : EMPTY,
    ),
    reduce(
      (all: T[], fetched: OffsetPage): T[] => all.concat(fetched.items),
      [] as T[],
    ),
  );
}
