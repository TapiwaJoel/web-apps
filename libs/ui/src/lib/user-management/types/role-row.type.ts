import { RoleResponseDto } from '@mushaviri/api';
import { StatusTone } from '../../status-pill/status-tone.type';

export interface RoleRow extends RoleResponseDto {
  statusTone: StatusTone;
}
