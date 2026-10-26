import { ExaminationPaperResponseDto } from '@mushaviri/api';
import { StatusTone } from '@mushaviri/ui';

export interface ExaminationPaperRow extends ExaminationPaperResponseDto {
  statusTone: StatusTone;
  /** "Subject · Level", resolved from the subjects and levels stores. */
  subjectLabel: string;
}
