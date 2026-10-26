import { SpeakerRoleDto } from '../../enums';

export interface UpdateSpeakerDto {
  role?: SpeakerRoleDto;
  audioEnabled?: boolean;
  videoEnabled?: boolean;
  screenSharingEnabled?: boolean;
}
