import { SubscriptionPlanResponseDto } from '@mushaviri/api';

/** Uniqueness clashes the backend would reject, detected client-side. */
export interface SubscriptionPlanConflicts {
  /** Another plan already uses this name (names are unique globally). */
  nameTaken: boolean;
  /** Another plan already covers this (level, currency, billing cycle). */
  duplicateCombination: SubscriptionPlanResponseDto | null;
}
