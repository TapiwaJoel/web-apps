import { SubscriptionReminderEvent } from '@mushaviri/api';

export const REMINDER_EVENT_LABELS: Record<SubscriptionReminderEvent, string> =
  {
    [SubscriptionReminderEvent.PRE_EXPIRY_NOTIFICATION]: 'Expiry reminder',
    [SubscriptionReminderEvent.SUBSCRIPTION_EXPIRATION]: 'Subscription expires',
    [SubscriptionReminderEvent.GRACE_PERIOD_NOTIFICATION]:
      'Grace period notice',
    [SubscriptionReminderEvent.SUBSCRIPTION_TERMINATION]:
      'Subscription terminated',
  };
