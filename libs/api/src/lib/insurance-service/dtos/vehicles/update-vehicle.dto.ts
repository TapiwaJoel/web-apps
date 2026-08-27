import { Currency, EntityStatus } from '../../../common';

export interface UpdateVehicleDto {
  vehicleType?: string; // MongoId
  vehicleUsage?: string;
  make?: string;
  model?: string;
  year?: number; // 1900 or later
  sumInsured?: number; // max 2 decimal places
  currency?: Currency; // USD or ZWG only
  status?: EntityStatus;
}
