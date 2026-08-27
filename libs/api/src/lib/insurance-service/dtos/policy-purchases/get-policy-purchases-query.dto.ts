import { EntityStatus } from '../../../common';

export interface GetPolicyPurchasesQueryDto {
  _id?: string;
  policyHolderId?: string;
  vrn?: string;
  paymentId?: string;
  partnerId?: string;
  status?: EntityStatus;
}
