import { EntityStatus } from '../../../common';
import { ExaminationPaperType } from '../../enums';

export interface ExaminationPaperResponseDto {
  _id: string;
  subjectId: string;
  name: string;
  description: string;
  type: ExaminationPaperType;
  numberOfQuestions: number;
  duration: number;
  marks: number;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}
