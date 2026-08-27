import { EntityStatus } from '../../../common';

export interface ComprehensiveRateResponseDto {
  _id: string;
  vehicleType: string;
  vehicleUsage: string;
  rate: number;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}
