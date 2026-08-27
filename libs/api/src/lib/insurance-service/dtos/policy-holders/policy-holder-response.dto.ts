import { EntityStatus } from '../../../common';

export interface PolicyHolderResponseDto {
  _id: string;
  systemUserId: string;
  nationalId?: string;
  driversLicence?: string;
  proofOfAddress?: string;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}
