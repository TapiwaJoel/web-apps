import { EntityStatus } from '../../../common';

export interface UpdateDeliveryAddressDto {
  region?: string;
  label?: string;
  addressLine?: string;
  latitude?: number; // decimal degrees, send together with longitude
  longitude?: number; // decimal degrees, send together with latitude
  directions?: string;
  contactPhone?: string;
  isDefault?: boolean;
  status?: EntityStatus;
}
