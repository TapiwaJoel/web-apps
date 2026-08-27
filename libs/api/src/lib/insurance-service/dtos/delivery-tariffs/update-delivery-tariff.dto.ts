import { Currency, EntityStatus } from '../../../common';

export interface UpdateDeliveryTariffDto {
  region?: string;
  baseFee?: number; // >= 0, max 2 decimal places
  perKmFee?: number; // >= 0, max 2 decimal places
  currency?: Currency; // USD or ZWG
  maxDistanceMetres?: number; // must be positive
  status?: EntityStatus;
}
