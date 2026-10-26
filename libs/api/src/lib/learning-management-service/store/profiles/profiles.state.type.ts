import { ProfileResponseDto } from '../../dtos';

export interface ProfilesState {
  profiles: ProfileResponseDto[];
  profilesLoaded: boolean;
  profilesLoading: boolean;
  profilesError: string | null;
}
