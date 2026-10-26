import { EntityStatus } from '@mushaviri/api';

export interface GradeForm {
  educationalLevelId: string;
  name: string;
  displayOrder: number | null;
  status: EntityStatus;
}
