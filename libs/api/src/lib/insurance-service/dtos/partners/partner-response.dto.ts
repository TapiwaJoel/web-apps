import { EntityStatus } from '../../../common';

export interface PartnerResponseDto {
  _id: string;
  systemUserId: string;
  commissionRate: number;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}
