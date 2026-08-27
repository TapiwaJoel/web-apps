import { EntityStatus } from '../../../common';

export interface UpdateVehicleTypeDto {
  name?: string;
  description?: string;
  status?: EntityStatus;
}
