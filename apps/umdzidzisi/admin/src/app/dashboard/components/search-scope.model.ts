/**
 * Search scopes for the header's global search. The `id` is the machine value a
 * future data layer reads to route a query to the right API/endpoint; `route` is
 * where pressing Enter navigates today (with the query as `?q=`), while the app
 * has no backend yet.
 */
export type SearchScopeId =
  | 'all'
  | 'examinations'
  | 'subjects'
  | 'learners'
  | 'subscriptions';

export interface SearchScope {
  /** Stable identity used to pick the API/endpoint for this scope. */
  id: SearchScopeId;
  /** Label shown in the chip and dropdown. */
  label: string;
  /** Flaticon regular-rounded class (reused from the nav config). */
  icon: string;
  /** Route to navigate on submit; the query rides along as `?q=`. */
  route: string;
  /** Scope-specific input placeholder. */
  placeholder: string;
}

/** Top-level scopes, mirroring the main nav sections. `all` is the default. */
export const SEARCH_SCOPES: SearchScope[] = [
  {
    id: 'all',
    label: 'All',
    icon: 'fi fi-rr-apps',
    route: 'dashboard',
    placeholder: 'Search everything…',
  },
  {
    id: 'examinations',
    label: 'Examinations',
    icon: 'fi fi-rr-graduation-cap',
    route: 'examinations',
    placeholder: 'Search examinations…',
  },
  {
    id: 'subjects',
    label: 'Subjects',
    icon: 'fi fi-rr-book-open-reader',
    route: 'subjects',
    placeholder: 'Search subjects…',
  },
  {
    id: 'learners',
    label: 'Learners',
    icon: 'fi fi-rr-user',
    route: 'profiles',
    placeholder: 'Search learners…',
  },
  {
    id: 'subscriptions',
    label: 'Subscriptions',
    icon: 'fi fi-rr-credit-card',
    route: 'subscriptions',
    placeholder: 'Search subscriptions…',
  },
];
