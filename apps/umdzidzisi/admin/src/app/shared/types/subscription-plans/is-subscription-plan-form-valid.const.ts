import { SubscriptionPlanForm } from './subscription-plan-form.type';

function isPositive(value: number | null): boolean {
  return value !== null && Number.isFinite(value) && value > 0;
}

/** Mirrors the backend's required fields and numeric bounds for a plan. */
export function isSubscriptionPlanFormValid(
  form: SubscriptionPlanForm,
): boolean {
  return (
    Boolean(form.educationalLevelId) &&
    form.name.trim() !== '' &&
    isPositive(form.price) &&
    Boolean(form.currency) &&
    isPositive(form.numberOfSubjects) &&
    Number.isInteger(form.numberOfSubjects) &&
    Boolean(form.billingCycle) &&
    form.gracePeriodDays !== null &&
    Number.isInteger(form.gracePeriodDays) &&
    form.gracePeriodDays >= 0
  );
}
