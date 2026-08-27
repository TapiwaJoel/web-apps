import { EntityStatus } from '../../../common';
import { PolicyComponent } from '../../enums';

export interface GetPoliciesQueryDto {
  _id?: string;
  policyPurchaseId?: string;
  vrn?: string;
  component?: PolicyComponent;
  insuranceCompany?: string;
  status?: EntityStatus;
}
