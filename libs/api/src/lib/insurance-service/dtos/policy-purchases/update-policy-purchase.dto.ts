import { EntityStatus } from '../../../common';

export interface UpdatePolicyPurchaseDto {
  partnerId?: string; // MongoId
  status?: EntityStatus;
}
