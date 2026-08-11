import { EntityStatus } from '../../../common';

export interface GradeResponseDto {
  _id: string;
  educationalLevelId: string;
  name: string;
  displayOrder: number;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}
