import { PeriodUnit } from '@mushaviri/api';

export interface CreatePolicyPeriodForm {
  name: string;
  period: number;
  unit: PeriodUnit;
}

export const EMPTY_FORM: CreatePolicyPeriodForm = {
  name: '',
  period: 0,
  unit: PeriodUnit.MONTHS,
};
