export interface SubscriptionFilters {
  status: string;
  subscriptionPlanId: string;
  startFrom: string | null;
  startTo: string | null;
  endFrom: string | null;
  endTo: string | null;
}
