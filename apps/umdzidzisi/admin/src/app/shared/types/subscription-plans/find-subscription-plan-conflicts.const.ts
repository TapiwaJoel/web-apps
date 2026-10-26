import { SubscriptionPlanResponseDto } from '@mushaviri/api';
import { SubscriptionPlanConflicts } from './subscription-plan-conflicts.type';
import { SubscriptionPlanForm } from './subscription-plan-form.type';

/**
 * Checks `form` against the loaded plans, ignoring `excludeId` (the plan being
 * edited), for a taken name or a duplicate (level, currency, cycle).
 */
export function findSubscriptionPlanConflicts(
  form: SubscriptionPlanForm,
  plans: SubscriptionPlanResponseDto[],
  excludeId: string | null = null,
): SubscriptionPlanConflicts {
  const others: SubscriptionPlanResponseDto[] = plans.filter(
    (plan: SubscriptionPlanResponseDto): boolean => plan._id !== excludeId,
  );
  const name: string = form.name.trim().toLowerCase();
  const nameTaken: boolean =
    name !== '' &&
    others.some(
      (plan: SubscriptionPlanResponseDto): boolean =>
        plan.name.trim().toLowerCase() === name,
    );
  const duplicateCombination: SubscriptionPlanResponseDto | null =
    form.educationalLevelId && form.currency && form.billingCycle
      ? (others.find(
          (plan: SubscriptionPlanResponseDto): boolean =>
            plan.educationalLevelId === form.educationalLevelId &&
            plan.currency === form.currency &&
            plan.billingCycle === form.billingCycle,
        ) ?? null)
      : null;
  return { nameTaken, duplicateCombination };
}
