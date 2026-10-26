export type SortDirection = 'asc' | 'desc' | null;

export interface ColumnFilter<T> {
  accessor: (row: T) => unknown;
  predicate: (value: unknown, filterValue: unknown) => boolean;
  value: unknown;
}

/**
 * A filter with an empty `value` (`''`, `null`, `undefined`) is treated as inactive.
 * `DateRange` values are checked via `isDateRangeActive` since `{ from: null, to: null }`
 * would otherwise never match the plain emptiness check above.
 */
function isActive(filter: { value: unknown }): boolean {
  const value: unknown = filter.value;
  if (
    value !== null &&
    typeof value === 'object' &&
    'from' in (value as Record<string, unknown>) &&
    'to' in (value as Record<string, unknown>)
  ) {
    return isDateRangeActive(value as DateRange);
  }
  return value !== '' && value !== null && value !== undefined;
}

export function filterRows<T>(rows: T[], filters: ColumnFilter<T>[]): T[] {
  const active: ColumnFilter<T>[] = filters.filter(isActive);
  if (active.length === 0) {
    return rows;
  }
  return rows.filter((row: T): boolean =>
    active.every((filter: ColumnFilter<T>): boolean =>
      filter.predicate(filter.accessor(row), filter.value),
    ),
  );
}

export function searchRows<T>(
  rows: T[],
  term: string,
  accessors: ((row: T) => unknown)[],
): T[] {
  const normalized: string = term.trim().toLowerCase();
  if (!normalized) {
    return rows;
  }
  return rows.filter((row: T): boolean =>
    accessors.some((accessor: (row: T) => unknown): boolean =>
      String(accessor(row) ?? '')
        .toLowerCase()
        .includes(normalized),
    ),
  );
}

export function sortRows<T>(
  rows: T[],
  key: ((row: T) => unknown) | null,
  direction: SortDirection,
): T[] {
  if (!key || !direction) {
    return rows;
  }
  const sign: number = direction === 'asc' ? 1 : -1;
  return [...rows].sort((a: T, b: T): number => {
    const left: unknown = key(a);
    const right: unknown = key(b);
    if (left === right) {
      return 0;
    }
    if (left == null) {
      return 1;
    }
    if (right == null) {
      return -1;
    }
    if (left instanceof Date && right instanceof Date) {
      return (left.getTime() - right.getTime()) * sign;
    }
    if (typeof left === 'number' && typeof right === 'number') {
      return (left - right) * sign;
    }
    return String(left).localeCompare(String(right)) * sign;
  });
}

export function paginateRows<T>(
  rows: T[],
  page: number,
  pageSize: number,
): T[] {
  const start: number = (page - 1) * pageSize;
  return rows.slice(start, start + pageSize);
}

/** Text "contains" predicate for `ColumnFilter.predicate`, case-insensitive. */
export function containsPredicate(
  value: unknown,
  filterValue: unknown,
): boolean {
  return String(value ?? '')
    .toLowerCase()
    .includes(String(filterValue ?? '').toLowerCase());
}

/** Exact-match predicate for select-driven filters (status, boolean flags, etc.). */
export function equalsPredicate(value: unknown, filterValue: unknown): boolean {
  return value === filterValue;
}

export interface DateRange {
  from: string | null;
  to: string | null;
}

/** Inclusive date-range predicate; `value` must be a `Date`, `from`/`to` are ISO date strings. */
export function dateRangePredicate(
  value: unknown,
  filterValue: unknown,
): boolean {
  const range: DateRange = filterValue as DateRange;
  if (!(value instanceof Date)) {
    return false;
  }
  if (range.from && value < new Date(range.from)) {
    return false;
  }
  if (range.to && value > new Date(`${range.to}T23:59:59.999`)) {
    return false;
  }
  return true;
}

/** Empty date ranges (`{ from: null, to: null }`) count as inactive, unlike `''`/`null` alone. */
export function isDateRangeActive(range: DateRange): boolean {
  return Boolean(range.from) || Boolean(range.to);
}
