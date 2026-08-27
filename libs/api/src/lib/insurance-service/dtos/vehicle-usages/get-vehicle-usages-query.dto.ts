import { EntityStatus } from '../../../common';

export interface GetVehicleUsagesQueryDto {
  _id?: string;
  vehicleType?: string;
  status?: EntityStatus;
}
