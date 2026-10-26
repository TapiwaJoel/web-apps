// Models
export * from './lib/models/theme.model';

// Services
export * from './lib/theme.service';
export * from './lib/title.service';

// Themes Configuration
export * from './lib/themes/theme-config';

// Auth — session state, route guards and HTTP plumbing.
// Lives here rather than in `api`, which holds regenerable stubs only.
export * from './lib/auth/session.store';
export * from './lib/auth/guards/conditional-auth.guard';
export * from './lib/auth/interceptors/api.interceptor';
export * from './lib/auth/interceptors/refresh.interceptor';

// Dev tooling
export * from './lib/dev/stale-chunk-recovery';

// Table data helpers — client-side filter/search/sort/paginate for hand-rolled tables
export * from './lib/table/table-data.util';

// Global search — bridges the topbar search input to the active routed page
export * from './lib/search/global-search.service';

// Admin user management — product-scoped service name, phone parsing, default role permissions
export * from './lib/admin/admin-service-name.token';
export * from './lib/phone/phone-number.util';
export * from './lib/permissions/base-permissions';
