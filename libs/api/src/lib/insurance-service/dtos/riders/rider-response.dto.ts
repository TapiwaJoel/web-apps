import { EntityStatus } from '../../../common';

export interface RiderResponseDto {
  _id: string;
  systemUserId: string;
  latitude?: number; // absent until the rider first reports in
  longitude?: number; // absent until the rider first reports in
  locationUpdatedAt?: string;
  isAvailable: boolean;
  activeJobId?: string;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}
