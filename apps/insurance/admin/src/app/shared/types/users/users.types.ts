import { SystemUserResponseDto, UserStatus } from '@mushaviri/api';

export type StatusTone = 'success' | 'warning' | 'error' | 'info';

export const STATUS_TONES: Record<UserStatus, StatusTone> = {
  [UserStatus.ACTIVE]: 'success',
  [UserStatus.PENDING]: 'info',
  [UserStatus.LOCKED]: 'warning',
  [UserStatus.SUSPENDED]: 'warning',
  [UserStatus.DELETED]: 'error',
};

export interface SystemUserRow extends SystemUserResponseDto {
  statusTone: StatusTone;
  roleName: string;
}
