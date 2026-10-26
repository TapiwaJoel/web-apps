import { PolicyPeriodResponseDto } from '@mushaviri/api';
import { StatusTone } from '@mushaviri/ui';

export interface PolicyPeriodRow extends PolicyPeriodResponseDto {
  statusTone: StatusTone;
}
