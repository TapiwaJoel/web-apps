import { EntityStatus } from '../../../common';

export interface GetVehiclesQueryDto {
  _id?: string;
  policyHolderId?: string;
  vrn?: string;
  vehicleType?: string;
  vehicleUsage?: string;
  status?: EntityStatus;
}
