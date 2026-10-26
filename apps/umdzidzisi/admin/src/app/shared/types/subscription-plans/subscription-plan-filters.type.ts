export interface SubscriptionPlanFilters {
  examinationBoardId: string;
  educationalLevelId: string;
  currency: string;
  billingCycle: string;
  status: string;
  createdFrom: string | null;
  createdTo: string | null;
}
