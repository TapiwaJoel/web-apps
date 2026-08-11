import { AuthenticationSettingsResponseDto } from './authentication-settings-response.dto';
import { TokenInfoDto } from './token-info.dto';
import { UserResponseDto } from '../users/user-response.dto';
import { SystemUserResponseDto } from '../system-users/system-user-response.dto';
import { DeviceResponseDto } from '../devices/device-response.dto';

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
