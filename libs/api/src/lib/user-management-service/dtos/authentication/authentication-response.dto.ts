import { AuthenticationSettingsResponseDto } from './authentication-settings-response.dto';
import { TokenInfoDto } from './token-info.dto';
import { UserResponseDto } from '../users';
import { SystemUserResponseDto } from '../system-users';
import { DeviceResponseDto } from '../devices';

export interface AuthenticationResponseDto {
  _id: string;
  authenticationSettings: AuthenticationSettingsResponseDto;
  user: UserResponseDto;
  systemUser: SystemUserResponseDto;
  device?: Partial<DeviceResponseDto>[];
  accessToken?: TokenInfoDto; // absent for web client (httpOnly cookie)
  refreshToken?: TokenInfoDto; // absent for web client (httpOnly cookie)
  createdAt: string;
  updatedAt: string;
}

export type WebAuthenticationResponseDto = Omit<
  AuthenticationResponseDto,
  'accessToken' | 'refreshToken'
>;
