import { EntityStatus } from '../../../common';

export interface UpdatePartnerDto {
  commissionRate?: number; // percentage, 0-100, max 2 decimal places
  status?: EntityStatus;
}
