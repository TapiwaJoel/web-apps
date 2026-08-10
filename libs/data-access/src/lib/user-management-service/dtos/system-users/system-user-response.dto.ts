import { UserStatus } from '../../enums';

export interface SystemUserResponseDto {
  _id: string;
  name: string;
  phoneNumber: string;
  emailAddress?: string;
  country: string;
  user: string;
  role: string;
  status: UserStatus;
  createdAt: string;
  updatedAt?: string;
}
