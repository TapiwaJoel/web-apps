import { ExaminationBoardResponseDto } from '@mushaviri/api';
import { StatusTone } from '@mushaviri/ui';

export interface ExaminationBoardRow extends ExaminationBoardResponseDto {
  statusTone: StatusTone;
  countryLabel: string;
}
