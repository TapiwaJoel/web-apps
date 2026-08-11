import { EntityStatus } from '../../../common';

export interface ExaminationResponseDto {
  _id: string;
  examinationBoardId: string;
  educationalLevelId: string;
  name: string;
  qualification?: string;
  description?: string;
  status: EntityStatus;
  date: string;
  createdAt: string;
  updatedAt: string;
}
