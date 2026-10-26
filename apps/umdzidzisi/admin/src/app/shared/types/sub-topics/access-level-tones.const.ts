import { AccessLevel } from '@mushaviri/api';
import { StatusTone } from '@mushaviri/ui';

export const ACCESS_LEVEL_TONES: Record<AccessLevel, StatusTone> = {
  [AccessLevel.FREE]: 'success',
  [AccessLevel.PAID]: 'warning',
};
