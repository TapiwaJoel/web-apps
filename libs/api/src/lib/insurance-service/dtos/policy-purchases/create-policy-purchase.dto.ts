import { Currency } from '../../../common';
import { CreatePolicyComponentDto } from './create-policy-component.dto';

export interface CreatePolicyPurchaseDto {
  policyHolderId: string; // MongoId
  vrn: string; // Zimbabwe registration number, e.g. ABC-1234
  paymentId: string;
  partnerId?: string; // MongoId
  totalAmount: number; // max 2 decimal places, must equal the sum of components
  currency: Currency; // USD or ZWG only
  components: CreatePolicyComponentDto[]; // at least one entry
  fulfilmentQuoteId?: string; // MongoId, omit for free collection
}
