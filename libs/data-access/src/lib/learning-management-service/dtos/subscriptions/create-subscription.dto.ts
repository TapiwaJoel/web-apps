export interface CreateSubscriptionDto {
  paymentId: string;
  subscriptionPlanId: string;
  subjects: string[];
}
