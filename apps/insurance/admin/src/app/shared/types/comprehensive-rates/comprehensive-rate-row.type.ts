import { ComprehensiveRateResponseDto } from '@mushaviri/api';
import { StatusTone } from '@mushaviri/ui';

export interface ComprehensiveRateRow extends ComprehensiveRateResponseDto {
  statusTone: StatusTone;
  vehicleTypeName: string;
  vehicleUsageLabel: string;
}
