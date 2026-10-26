import { EntityStatus } from '@mushaviri/api';
import { StatusTone } from './status-tone.type';

export const STATUS_TONES: Record<EntityStatus, StatusTone> = {
  [EntityStatus.ACTIVE]: 'success',
  [EntityStatus.INACTIVE]: 'warning',
  [EntityStatus.DELETED]: 'error',
};
