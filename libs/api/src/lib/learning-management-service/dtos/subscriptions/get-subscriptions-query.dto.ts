import { SubscriptionStatus } from '../../enums';

/**
 * Query filters for `GET /subscriptions`. Pagination and sorting are NOT query
 * params on this endpoint — they travel as X-Page / X-Limit / X-Sort-By /
 * X-Sort-Order headers (see `HeaderPaginationParams`).
 */
export interface GetSubscriptionsQueryDto {
  status?: SubscriptionStatus;
  systemUserId?: string;
  subscriptionPlanId?: string;
  /** ISO date string; filters `startDate >= startDateFrom`. */
  startDateFrom?: string;
  /** ISO date string; filters `startDate <= startDateTo`. */
  startDateTo?: string;
  /** ISO date string; filters `endDate >= endDateFrom`. */
  endDateFrom?: string;
  /** ISO date string; filters `endDate <= endDateTo`. */
  endDateTo?: string;
  populate?: boolean;
  includeNotificationSchedule?: boolean;
}
