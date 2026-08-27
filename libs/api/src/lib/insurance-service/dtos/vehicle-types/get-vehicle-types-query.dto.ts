import { EntityStatus } from '../../../common';

export interface GetVehicleTypesQueryDto {
  _id?: string;
  name?: string;
  status?: EntityStatus;
}
