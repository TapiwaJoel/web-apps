import { SubscriptionPlanResponseDto } from '@mushaviri/api';
import { StatusTone } from '@mushaviri/ui';

export interface SubscriptionPlanRow extends SubscriptionPlanResponseDto {
  statusTone: StatusTone;
  educationalLevelName: string;
  examinationBoardName: string;
  priceLabel: string;
  billingCycleLabel: string;
}
