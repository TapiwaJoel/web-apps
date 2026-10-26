import { InsuranceCoverageTypeResponseDto } from '@mushaviri/api';
import { StatusTone } from './status-tone.type';

export interface InsuranceCoverageTypeRow extends InsuranceCoverageTypeResponseDto {
  statusTone: StatusTone;
  insuranceCompanyLabel: string;
}
