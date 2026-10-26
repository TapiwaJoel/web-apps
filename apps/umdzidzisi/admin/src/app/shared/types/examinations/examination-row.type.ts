import { ExaminationResponseDto } from '@mushaviri/api';
import { StatusTone } from '@mushaviri/ui';

export interface ExaminationRow extends ExaminationResponseDto {
  statusTone: StatusTone;
  examinationBoardName: string;
  educationalLevelName: string;
}
