import { EntityStatus } from '../../../common';

export interface GetPolicyHoldersQueryDto {
  _id?: string;
  systemUserId?: string;
  nationalId?: string;
  status?: EntityStatus;
}
