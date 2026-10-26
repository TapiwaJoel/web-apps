import { CountryStatus } from '@mushaviri/api';
import { SelectOption } from './select-option.type';

export const COUNTRY_STATUS_OPTIONS: SelectOption<CountryStatus>[] = [
  { value: CountryStatus.ACTIVE, label: 'Active' },
  { value: CountryStatus.INACTIVE, label: 'Inactive' },
];
