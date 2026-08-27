import { PolicyComponent } from '../../enums';

export interface CreatePolicyDto {
  policyPurchaseId: string;
  component: PolicyComponent;
  insuranceType?: string; // required for the Insurance component, absent otherwise
  insuranceCompany?: string; // required for the Insurance component, absent otherwise
  policyPeriod: string;
  startDate: string; // ISO 8601 date string
  amount: number; // positive, max 2 decimals
}
