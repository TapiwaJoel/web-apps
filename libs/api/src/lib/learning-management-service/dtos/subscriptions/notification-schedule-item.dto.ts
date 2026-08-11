/**
 * Simplified mirror of backend SubscriptionReminderEvent + CommunicationChannel enums,
 * inlined here as string literal unions since only the subscription response references them.
 */
export type SubscriptionReminderEvent =
  | 'PRE_EXPIRY_NOTIFICATION'
  | 'SUBSCRIPTION_EXPIRATION'
  | 'GRACE_PERIOD_NOTIFICATION'
  | 'SUBSCRIPTION_TERMINATION';

export type CommunicationChannel = 'EMAIL' | 'SMS' | 'IN_APP' | 'PUSH';

/** A single scheduled notification for a subscription (offline support). */
export interface NotificationScheduleItemDto {
  event: SubscriptionReminderEvent;
  scheduledDate: string;
  notificationDay: number;
  channels: CommunicationChannel[];
  isPastDue: boolean;
}
