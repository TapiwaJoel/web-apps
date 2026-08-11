import { EntityStatus } from '../../../common';
import { ExaminationPaperType } from '../../enums';

export interface CreateExaminationPaperDto {
  subjectId: string;
  name: string;
  description: string;
  type: ExaminationPaperType;
  numberOfQuestions: number;
  duration: number;
  marks: number;
  status?: EntityStatus;
}
