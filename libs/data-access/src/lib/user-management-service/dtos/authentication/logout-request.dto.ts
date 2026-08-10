import { LogoutScope } from '../enums';

export interface LogoutRequestDto {
  scope?: LogoutScope;
  deviceId?: string;
}
