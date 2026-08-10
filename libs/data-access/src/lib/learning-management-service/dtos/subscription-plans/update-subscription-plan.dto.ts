import { Currency, EntityStatus } from '../../../common';
import { BillingCycle } from '../enums';

export interface UpdateSubscriptionPlanDto {
  educationalLevelId?: string;
  name?: string;
  description?: string;
  numberOfSubjects?: number;
  price?: number;
  currency?: Currency;
  billingCycle?: BillingCycle;
  gracePeriodDays?: number;
  status?: EntityStatus;
}
