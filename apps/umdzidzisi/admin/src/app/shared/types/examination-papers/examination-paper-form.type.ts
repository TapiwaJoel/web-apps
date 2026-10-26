import { EntityStatus, ExaminationPaperType } from '@mushaviri/api';

/**
 * Form model shared by the create dialog and the detail drawer. Enum fields
 * start as '' so the selects can show a "Select…" placeholder.
 */
export interface ExaminationPaperForm {
  subjectId: string;
  name: string;
  description: string;
  type: ExaminationPaperType | '';
  numberOfQuestions: number | null;
  duration: number | null;
  marks: number | null;
  status: EntityStatus;
}
