import { EntityStatus } from '../../../common';

export interface GetComprehensiveRatesQueryDto {
  _id?: string;
  vehicleType?: string;
  vehicleUsage?: string;
  status?: EntityStatus;
}
