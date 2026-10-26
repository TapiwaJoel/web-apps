import { EntityStatus } from '@mushaviri/api';

/** Editable fields of an examination in its detail drawer. */
export interface ExaminationForm {
  examinationBoardId: string;
  educationalLevelId: string;
  name: string;
  qualification: string;
  description: string;
  status: EntityStatus;
}
