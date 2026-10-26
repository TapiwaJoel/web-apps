import { BillingCycle } from '@mushaviri/api';
import { SelectOption } from './select-option.type';

export const BILLING_CYCLE_OPTIONS: SelectOption<BillingCycle>[] = [
  { value: BillingCycle.WEEKLY, label: 'Weekly' },
  { value: BillingCycle.BI_WEEKLY, label: 'Bi-weekly' },
  { value: BillingCycle.MONTHLY, label: 'Monthly' },
];
