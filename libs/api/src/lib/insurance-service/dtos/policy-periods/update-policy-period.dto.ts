import { EntityStatus } from '../../../common';
import { PeriodUnit } from '../../enums';

export interface UpdatePolicyPeriodDto {
  name?: string;
  period?: number; // integer >= 0; the period/unit combination must remain unique
  unit?: PeriodUnit;
  status?: EntityStatus;
}
