import { AccessLevel } from '@mushaviri/api';
import { SelectOption } from './select-option.type';

export const ACCESS_LEVEL_OPTIONS: SelectOption<AccessLevel>[] = [
  { value: AccessLevel.FREE, label: 'Free' },
  { value: AccessLevel.PAID, label: 'Paid' },
];
