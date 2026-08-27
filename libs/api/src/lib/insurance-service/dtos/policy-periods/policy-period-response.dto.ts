import { EntityStatus } from '../../../common';
import { PeriodUnit } from '../../enums';

export interface PolicyPeriodResponseDto {
  _id: string;
  name: string;
  period: number; // 0 means the component is not taken
  unit: PeriodUnit;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}
