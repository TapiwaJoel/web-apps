import { Currency } from '@mushaviri/api';
import { SelectOption } from './select-option.type';

export const CURRENCY_OPTIONS: SelectOption<Currency>[] = [
  { value: Currency.USD, label: 'USD' },
  { value: Currency.ZWG, label: 'ZWG' },
  { value: Currency.ZAR, label: 'ZAR' },
];
