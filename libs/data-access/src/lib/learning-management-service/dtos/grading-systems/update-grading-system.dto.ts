import { EntityStatus } from '../../../common';

export interface UpdateGradingSystemDto {
  examinationId?: string;
  name?: string;
  description?: string;
  status?: EntityStatus;
}
