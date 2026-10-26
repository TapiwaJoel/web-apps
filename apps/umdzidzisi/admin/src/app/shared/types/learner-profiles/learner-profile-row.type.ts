import { ProfileResponseDto } from '@mushaviri/api';
import { StatusTone } from '@mushaviri/ui';

export interface LearnerProfileRow extends ProfileResponseDto {
  statusTone: StatusTone;
  userName: string;
  typeLabel: string;
  educationalLevelName: string;
  gradeName: string;
}
