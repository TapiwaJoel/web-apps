import { Currency } from '../../../common';
import { PaymentProviderStatus, PaymentProviderType } from '../enums';

export interface PaymentProviderResponseDto {
  id: string;
  name: string;
  code: string;
  displayName: string;
  type: PaymentProviderType;
  status: PaymentProviderStatus;
  supportedCurrencies: Currency[];
  description?: string;
  logoUrl?: string;
  transactionLimits?: {
    min?: number;
    max?: number;
    daily?: number;
    monthly?: number;
  };
  fees?: {
    percentage?: number;
    fixed?: number;
    currency?: Currency;
  };
  sortOrder: number;
  isEnabled: boolean;
}
