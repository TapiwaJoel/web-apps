import { SubscriptionPlanResponseDto } from '../../dtos';

export interface SubscriptionPlansState {
  subscriptionPlans: SubscriptionPlanResponseDto[];
  subscriptionPlansLoaded: boolean;
  subscriptionPlansLoading: boolean;
  subscriptionPlansError: string | null;
}
