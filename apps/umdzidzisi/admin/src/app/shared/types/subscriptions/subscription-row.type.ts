import { SubscriptionResponseDto } from '@mushaviri/api';
import { StatusTone } from '@mushaviri/ui';

export interface SubscriptionRow extends SubscriptionResponseDto {
  statusTone: StatusTone;
  statusLabel: string;
  subscriberName: string;
  planName: string;
  amountLabel: string;
  billingCycleLabel: string;
}
