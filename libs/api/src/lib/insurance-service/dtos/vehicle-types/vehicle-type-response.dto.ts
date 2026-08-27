import { EntityStatus } from '../../../common';

export interface VehicleTypeResponseDto {
  _id: string;
  name: string;
  description?: string;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}
