import { PolicyComponent } from '../../enums';

export interface CreatePolicyComponentDto {
  component: PolicyComponent;
  insuranceType?: string; // MongoId, required for the Insurance component
  insuranceCompany?: string; // MongoId, required for the Insurance component
  policyPeriod: string; // MongoId
  startDate: string; // ISO 8601 date-time
  amount: number; // max 2 decimal places
}
