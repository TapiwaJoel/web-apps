import { GradingSystemResponseDto } from '@mushaviri/api';
import { StatusTone } from '@mushaviri/ui';

export interface GradingSystemRow extends GradingSystemResponseDto {
  statusTone: StatusTone;
  examinationName: string;
  scaleCount: number;
}
