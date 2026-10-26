import { SubscriptionResponseDto } from '../../dtos';

export interface SubscriptionsState {
  subscriptions: SubscriptionResponseDto[];
  subscriptionsLoaded: boolean;
  subscriptionsLoading: boolean;
  subscriptionsError: string | null;
}
