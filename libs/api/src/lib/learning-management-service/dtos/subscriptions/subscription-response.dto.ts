import { Currency } from '../../../common';
import { BillingCycle, SubscriptionStatus } from '../../enums';
import { SubjectResponseDto } from '../subjects';
import { NotificationScheduleItemDto } from './notification-schedule-item.dto';

export interface SubscriptionResponseDto {
  _id: string;
  systemUserId: string;
  /**
   * Always a string id. `populate=true` populates this field server-side, but
   * the backend's document→entity mapper stringifies it, so no populated plan
   * object reaches the client.
   */
  subscriptionPlanId: string;
  paymentId?: string;
  status: SubscriptionStatus;
  amount: number;
  currency: Currency;
  startDate: string;
  endDate: string;
  gracePeriodEndDate?: string;
  billingCycle: BillingCycle;
  /** Omitted when no subjects are attached to the entity (e.g. list results). */
  subjects?: SubjectResponseDto[];
  /** Empty unless `includeNotificationSchedule=true`. */
  notificationSchedule: NotificationScheduleItemDto[];
  createdAt: string;
  /**
   * Declared required by the backend DTO, but the backend's document→entity
   * mapper does not copy `updatedAt`, so it is absent on the wire.
   */
  updatedAt?: string;
}
