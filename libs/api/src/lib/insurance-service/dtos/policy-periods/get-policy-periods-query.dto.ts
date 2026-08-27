import { EntityStatus } from '../../../common';
import { PeriodUnit } from '../../enums';

export interface GetPolicyPeriodsQueryDto {
  _id?: string;
  period?: number;
  unit?: PeriodUnit;
  status?: EntityStatus;
}
