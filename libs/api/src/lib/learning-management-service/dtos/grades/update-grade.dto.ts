import { EntityStatus } from '../../../common';

export interface UpdateGradeDto {
  educationalLevelId?: string;
  name?: string;
  displayOrder?: number;
  status?: EntityStatus;
}
