import { EntityStatus } from '../../../common';
import { ExaminationPaperType } from '../../enums';

export interface UpdateExaminationPaperDto {
  subjectId?: string;
  name?: string;
  description?: string;
  type?: ExaminationPaperType;
  numberOfQuestions?: number;
  duration?: number;
  marks?: number;
  status?: EntityStatus;
}
