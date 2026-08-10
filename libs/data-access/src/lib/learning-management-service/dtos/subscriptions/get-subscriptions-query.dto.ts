import { PaginationParams } from '../../../common';
import { SubscriptionStatus } from '../enums';

export interface GetSubscriptionsQueryDto extends PaginationParams {
  status?: SubscriptionStatus;
  systemUserId?: string;
  subscriptionPlanId?: string;
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  populate?: boolean;
  includeNotificationSchedule?: boolean;
}
