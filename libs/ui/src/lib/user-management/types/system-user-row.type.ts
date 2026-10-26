import { SystemUserResponseDto } from '@mushaviri/api';
import { StatusTone } from '../../status-pill/status-tone.type';

export interface SystemUserRow extends SystemUserResponseDto {
  statusTone: StatusTone;
  roleName: string;
}
