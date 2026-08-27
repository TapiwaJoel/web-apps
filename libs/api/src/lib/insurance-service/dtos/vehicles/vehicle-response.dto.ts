import { Currency, EntityStatus } from '../../../common';

export interface VehicleResponseDto {
  _id: string;
  policyHolderId: string;
  vrn: string;
  vehicleType: string;
  vehicleUsage: string;
  make: string;
  model: string;
  year: number;
  sumInsured: number;
  currency: Currency;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}
