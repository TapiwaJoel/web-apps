import { UserType } from '../../enums';
import { UserStatus } from '../../enums';

export interface UserResponseDto {
  _id: string;
  name: string;
  phoneNumber: string;
  emailAddress?: string;
  userType: UserType;
  status: UserStatus;
  country: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}
