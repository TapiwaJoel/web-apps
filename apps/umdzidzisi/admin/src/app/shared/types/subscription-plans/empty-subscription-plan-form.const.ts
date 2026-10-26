import { SubscriptionPlanForm } from './subscription-plan-form.type';

export const EMPTY_SUBSCRIPTION_PLAN_FORM: SubscriptionPlanForm = {
  educationalLevelId: '',
  name: '',
  description: '',
  price: null,
  currency: '',
  numberOfSubjects: null,
  billingCycle: '',
  gracePeriodDays: 0,
};
