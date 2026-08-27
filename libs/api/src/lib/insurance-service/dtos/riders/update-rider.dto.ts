import { EntityStatus } from '../../../common';

export interface UpdateRiderDto {
  isAvailable?: boolean;
  status?: EntityStatus;
}
