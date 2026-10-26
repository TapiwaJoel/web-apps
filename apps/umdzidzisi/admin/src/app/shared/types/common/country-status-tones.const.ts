import { CountryStatus } from '@mushaviri/api';
import { StatusTone } from '@mushaviri/ui';

export const COUNTRY_STATUS_TONES: Record<CountryStatus, StatusTone> = {
  [CountryStatus.ACTIVE]: 'success',
  [CountryStatus.INACTIVE]: 'warning',
};
