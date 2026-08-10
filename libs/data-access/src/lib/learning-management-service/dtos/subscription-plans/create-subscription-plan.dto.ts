import { Currency } from '../../../common';
import { BillingCycle } from '../enums';

export interface CreateSubscriptionPlanDto {
  educationalLevelId: string;
  name: string;
  description?: string;
  price: number;
  numberOfSubjects: number;
  currency: Currency;
  billingCycle: BillingCycle;
  gracePeriodDays: number;
}
