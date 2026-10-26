import { EntityStatus } from '../../../common';

export interface GetGradingSystemsQueryDto {
  _id?: string;
  name?: string;
  examinationId?: string;
  status?: EntityStatus;
}
