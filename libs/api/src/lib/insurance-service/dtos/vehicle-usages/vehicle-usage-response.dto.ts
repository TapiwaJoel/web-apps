import { EntityStatus } from '../../../common';

export interface VehicleUsageResponseDto {
  _id: string;
  vehicleType: string;
  usages: string[];
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}
