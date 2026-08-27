import { EntityStatus } from '../../../common';

export interface DeliveryAddressResponseDto {
  region: string;
  _id: string;
  label: string;
  addressLine: string;
  latitude: number; // decimal degrees, -90 to 90
  longitude: number; // decimal degrees, -180 to 180
  directions?: string;
  contactPhone: string;
  isDefault: boolean;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}
