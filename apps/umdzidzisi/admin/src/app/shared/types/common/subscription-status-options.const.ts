import { SubscriptionStatus } from '@mushaviri/api';
import { SelectOption } from './select-option.type';

export const SUBSCRIPTION_STATUS_OPTIONS: SelectOption<SubscriptionStatus>[] = [
  { value: SubscriptionStatus.ACTIVE, label: 'Active' },
  { value: SubscriptionStatus.GRACE_PERIOD, label: 'Grace period' },
  {
    value: SubscriptionStatus.PAYMENT_VERIFICATION_REQUIRED,
    label: 'Payment verification required',
  },
  { value: SubscriptionStatus.SUSPENDED, label: 'Suspended' },
  { value: SubscriptionStatus.CANCELLED, label: 'Cancelled' },
  { value: SubscriptionStatus.EXPIRED, label: 'Expired' },
];
