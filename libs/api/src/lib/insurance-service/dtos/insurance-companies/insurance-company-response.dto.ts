import { EntityStatus } from '../../../common';

export interface InsuranceCompanyResponseDto {
  _id: string;
  systemUserId: string;
  commissionRate: number;
  marketingRate: number;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}
