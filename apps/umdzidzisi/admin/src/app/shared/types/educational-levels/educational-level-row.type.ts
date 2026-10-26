import { EducationalLevelResponseDto } from '@mushaviri/api';
import { StatusTone } from '@mushaviri/ui';

export interface EducationalLevelRow extends EducationalLevelResponseDto {
  statusTone: StatusTone;
  examinationBoardName: string;
}
