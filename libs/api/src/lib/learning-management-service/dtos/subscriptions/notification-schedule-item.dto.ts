import { CommunicationChannel, SubscriptionReminderEvent } from '../../enums';

/** A single scheduled notification for a subscription (offline support). */
export interface NotificationScheduleItemDto {
  event: SubscriptionReminderEvent;
  scheduledDate: string;
  notificationDay: number;
  channels: CommunicationChannel[];
  isPastDue: boolean;
}
