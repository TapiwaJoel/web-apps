import { EntityStatus } from '@mushaviri/api';

/** Editable fields of a grading system in its detail drawer. */
export interface GradingSystemForm {
  examinationId: string;
  name: string;
  description: string;
  status: EntityStatus;
}
