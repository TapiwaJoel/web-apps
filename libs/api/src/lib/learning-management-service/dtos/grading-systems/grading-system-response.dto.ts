import { EntityStatus } from '../../../common';

export interface GradingSystemResponseDto {
  _id: string;
  examinationId: string;
  name: string;
  description?: string;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}
