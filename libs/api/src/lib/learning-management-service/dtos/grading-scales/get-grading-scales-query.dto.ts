import { EntityStatus } from '../../../common';

export interface GetGradingScalesQueryDto {
  _id?: string;
  gradingSystemId?: string;
  status?: EntityStatus;
}
