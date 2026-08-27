import { EntityStatus } from '../../../common';

export interface GetRidersQueryDto {
  _id?: string;
  systemUserId?: string;
  status?: EntityStatus;
}
