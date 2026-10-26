import { EntityStatus } from '@mushaviri/api';
import { ExaminationPaperForm } from './examination-paper-form.type';

export const EMPTY_EXAMINATION_PAPER_FORM: ExaminationPaperForm = {
  subjectId: '',
  name: '',
  description: '',
  type: '',
  numberOfQuestions: null,
  duration: null,
  marks: null,
  status: EntityStatus.ACTIVE,
};
