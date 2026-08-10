import { UserType, UserStatus } from '../enums';

export interface UpdateUserDto {
  _id?: string;
  role?: string;
  name: string;
  userType: UserType;
  status: UserStatus;
}
