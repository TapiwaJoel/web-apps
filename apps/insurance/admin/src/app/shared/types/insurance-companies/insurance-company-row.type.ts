import { InsuranceCompanyResponseDto } from '@mushaviri/api';
import { StatusTone } from '@mushaviri/ui';

export interface InsuranceCompanyRow extends InsuranceCompanyResponseDto {
  userName: string;
  statusTone: StatusTone;
}
