import { SpeakerRoleDto } from './add-speaker.dto';

export interface UpdateSpeakerDto {
  role?: SpeakerRoleDto;
  audioEnabled?: boolean;
  videoEnabled?: boolean;
  screenSharingEnabled?: boolean;
}
