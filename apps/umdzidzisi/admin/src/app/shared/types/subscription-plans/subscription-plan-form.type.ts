import { BillingCycle, Currency } from '@mushaviri/api';

/** Editable plan fields shared by the create dialog and the detail drawer. */
export interface SubscriptionPlanForm {
  educationalLevelId: string;
  name: string;
  description: string;
  price: number | null;
  currency: Currency | '';
  numberOfSubjects: number | null;
  billingCycle: BillingCycle | '';
  gracePeriodDays: number | null;
}
