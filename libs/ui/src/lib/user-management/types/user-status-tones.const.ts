import { UserStatus } from '@mushaviri/api';
import { StatusTone } from '../../status-pill/status-tone.type';

export const USER_STATUS_TONES: Record<UserStatus, StatusTone> = {
  [UserStatus.ACTIVE]: 'success',
  [UserStatus.PENDING]: 'info',
  [UserStatus.LOCKED]: 'warning',
  [UserStatus.SUSPENDED]: 'warning',
  [UserStatus.DELETED]: 'error',
};
