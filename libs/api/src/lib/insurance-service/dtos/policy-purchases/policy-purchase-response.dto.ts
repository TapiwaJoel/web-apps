import { Currency, EntityStatus } from '../../../common';

export interface PolicyPurchaseResponseDto {
  _id: string;
  policyHolderId: string;
  vrn: string;
  paymentId: string;
  partnerId?: string;
  totalAmount: number;
  currency: Currency;
  purchaseDate: string;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}
