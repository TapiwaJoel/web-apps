import { PeriodUnit } from '../../enums';

export interface CreatePolicyPeriodDto {
  name: string;
  period: number; // integer >= 0; 0 means the component is not taken (Insurance and Radio only)
  unit: PeriodUnit;
}
