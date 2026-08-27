import { Currency } from '../../../common';

export interface CreateVehicleDto {
  policyHolderId: string; // MongoId
  vrn: string; // Zimbabwe registration number, e.g. ABC-1234
  vehicleType: string; // MongoId
  vehicleUsage: string;
  make: string;
  model: string;
  year: number; // 1900 or later
  sumInsured: number; // max 2 decimal places
  currency: Currency; // USD or ZWG only
}
