import { Currency } from '../../../common';
import { PaymentStatus } from '../enums';

export interface PaymentResponseDto {
  _id: string;
  systemUser: string;
  currency: Currency;
  amount: number;
  narration: string;
  provider: string;
  status: PaymentStatus;
  externalReference?: string;
  innbucksInfo?: {
    authorizationCode: string;
    expiresAt: string;
  };
  createdAt: string;
  updatedAt: string;
}
