import { SpeakerRoleDto } from '../../enums';

export interface AddSpeakerDto {
  userId: string;
  role: SpeakerRoleDto;
}
