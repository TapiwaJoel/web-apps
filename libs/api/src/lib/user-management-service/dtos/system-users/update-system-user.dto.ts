import { UserStatus } from '../../enums';

export interface UpdateSystemUserDto {
  name?: string;
  role?: string;
  status?: UserStatus;
}
