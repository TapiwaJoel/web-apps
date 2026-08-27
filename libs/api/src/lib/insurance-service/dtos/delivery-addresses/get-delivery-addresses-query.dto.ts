import { EntityStatus } from '../../../common';

export interface GetDeliveryAddressesQueryDto {
  _id?: string;
  isDefault?: boolean;
  status?: EntityStatus;
}
