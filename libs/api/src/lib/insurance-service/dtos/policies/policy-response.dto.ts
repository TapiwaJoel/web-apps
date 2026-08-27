import { EntityStatus } from '../../../common';
import { PolicyComponent } from '../../enums';

export interface PolicyResponseDto {
  _id: string;
  policyPurchaseId: string;
  vrn: string;
  component: PolicyComponent;
  insuranceType?: string;
  insuranceCompany?: string;
  policyPeriod: string;
  startDate: string;
  endDate: string; // derived from startDate plus the policyPeriod
  amount: number;
  status: EntityStatus;
  policyNumber?: string; // absent until the insurer issues it; documents cannot print before then
  discSerial?: string; // present only once the holder has taken receipt
  createdAt: string;
  updatedAt: string;
}
