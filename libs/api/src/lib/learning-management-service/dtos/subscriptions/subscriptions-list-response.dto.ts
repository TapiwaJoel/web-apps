import { SubscriptionResponseDto } from './subscription-response.dto';

/**
 * `data` payload of `GET /subscriptions` (commons-lib `SubscriptionListResponseDto`).
 * Unlike most list endpoints this is NOT a `PaginateResult` — the backend
 * reshapes it to `subscriptions` + `totalCount`.
 */
export interface SubscriptionsListResponseDto {
  subscriptions: SubscriptionResponseDto[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
