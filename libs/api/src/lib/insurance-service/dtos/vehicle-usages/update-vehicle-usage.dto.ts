import { EntityStatus } from '../../../common';

export interface UpdateVehicleUsageDto {
  usages?: string[]; // at least one entry when supplied
  status?: EntityStatus;
}
