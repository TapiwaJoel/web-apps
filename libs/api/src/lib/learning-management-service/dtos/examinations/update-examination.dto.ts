import { EntityStatus } from '../../../common';

export interface UpdateExaminationDto {
  examinationBoardId?: string;
  educationalLevelId?: string;
  name?: string;
  qualification?: string;
  description?: string;
  status?: EntityStatus;
}
