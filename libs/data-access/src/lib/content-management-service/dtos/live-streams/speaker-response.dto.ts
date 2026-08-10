import { SpeakerRole, ConnectionState } from '../../enums';

export interface SpeakerResponseDto {
  _id: string;
  streamId: string;
  userId: string;
  role: SpeakerRole;
  connectionState: ConnectionState;
  audioEnabled: boolean;
  videoEnabled: boolean;
  screenSharingEnabled: boolean;
  joinedAt: string;
  leftAt: string | null;
}
