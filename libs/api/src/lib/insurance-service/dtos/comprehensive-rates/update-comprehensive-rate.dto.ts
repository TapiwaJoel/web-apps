import { EntityStatus } from '../../../common';

export interface UpdateComprehensiveRateDto {
  vehicleUsage?: string;
  rate?: number; // percentage 0-100, max 4 decimal places
  status?: EntityStatus;
}
