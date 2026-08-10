import { Currency } from '../../../common';
import { BillingCycle, SubscriptionStatus } from '../../enums';
import { SubjectResponseDto } from '../subjects';
import { NotificationScheduleItemDto } from './notification-schedule-item.dto';

export interface SubscriptionResponseDto {
  _id: string;
  systemUserId: string;
  subscriptionPlanId: string;
  paymentId?: string;
  status: SubscriptionStatus;
  amount: number;
  currency: Currency;
  startDate: string;
  endDate: string;
  gracePeriodEndDate?: string;
  billingCycle: BillingCycle;
  subjects?: SubjectResponseDto[];
  notificationSchedule: NotificationScheduleItemDto[];
  createdAt: string;
  updatedAt: string;
}
