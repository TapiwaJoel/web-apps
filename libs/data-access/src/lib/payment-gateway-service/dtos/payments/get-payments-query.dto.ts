import { Currency } from '../../../common';
import { PaymentStatus } from '../enums';

export interface GetPaymentsQueryDto {
  id?: string;
  systemUser?: string;
  status?: PaymentStatus;
  currency?: Currency;
  provider?: string;
  externalReference?: string;
  fromDate?: string;
  toDate?: string;
}
