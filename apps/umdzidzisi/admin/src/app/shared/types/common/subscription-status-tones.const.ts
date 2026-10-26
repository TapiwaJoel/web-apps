import { SubscriptionStatus } from '@mushaviri/api';
import { StatusTone } from '@mushaviri/ui';

export const SUBSCRIPTION_STATUS_TONES: Record<SubscriptionStatus, StatusTone> =
  {
    [SubscriptionStatus.ACTIVE]: 'success',
    [SubscriptionStatus.GRACE_PERIOD]: 'warning',
    [SubscriptionStatus.PAYMENT_VERIFICATION_REQUIRED]: 'warning',
    [SubscriptionStatus.SUSPENDED]: 'error',
    [SubscriptionStatus.CANCELLED]: 'error',
    [SubscriptionStatus.EXPIRED]: 'error',
  };
