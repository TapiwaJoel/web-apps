import { GradeResponseDto } from '@mushaviri/api';
import { StatusTone } from '@mushaviri/ui';

export interface GradeRow extends GradeResponseDto {
  statusTone: StatusTone;
  examinationBoardId: string;
  /** "Level · Board" */
  levelLabel: string;
}
