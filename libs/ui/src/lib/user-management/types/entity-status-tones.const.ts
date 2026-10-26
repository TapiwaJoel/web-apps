import { EntityStatus } from '@mushaviri/api';
import { StatusTone } from '../../status-pill/status-tone.type';

export const ENTITY_STATUS_TONES: Record<EntityStatus, StatusTone> = {
  [EntityStatus.ACTIVE]: 'success',
  [EntityStatus.INACTIVE]: 'warning',
  [EntityStatus.DELETED]: 'error',
};
