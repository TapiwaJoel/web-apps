import { Currency, EntityStatus } from '../../../common';

export interface GetDeliveryTariffsQueryDto {
  _id?: string;
  region?: string;
  currency?: Currency; // USD or ZWG
  status?: EntityStatus;
}
