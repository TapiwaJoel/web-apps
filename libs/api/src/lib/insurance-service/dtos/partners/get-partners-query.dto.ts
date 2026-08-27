import { EntityStatus } from '../../../common';

export interface GetPartnersQueryDto {
  _id?: string;
  systemUserId?: string;
  status?: EntityStatus;
}
