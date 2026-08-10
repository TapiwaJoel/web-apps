import { Currency } from '../../../common';

export interface CreatePaymentDto {
  currency: Currency;
  amount: number;
  narration: string;
  sourceAccount: string;
  provider: string;
  systemUser?: string;
}
