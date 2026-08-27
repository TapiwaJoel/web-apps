import { Currency, EntityStatus } from '../../../common';

export interface DeliveryTariffResponseDto {
  _id: string;
  region: string;
  baseFee: number;
  perKmFee: number;
  currency: Currency;
  maxDistanceMetres: number;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}
