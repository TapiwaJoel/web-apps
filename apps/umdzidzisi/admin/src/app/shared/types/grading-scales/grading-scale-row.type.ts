import { GradingScaleResponseDto } from '@mushaviri/api';
import { StatusTone } from '@mushaviri/ui';

export interface GradingScaleRow extends GradingScaleResponseDto {
  statusTone: StatusTone;
  gradingSystemName: string;
}
