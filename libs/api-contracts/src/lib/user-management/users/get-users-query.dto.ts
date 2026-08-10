import { UserType, UserStatus } from '../enums';
import { PaginationParams } from '../../common';

export interface GetUsersQueryDto extends PaginationParams {
  _id?: string;
  userType?: UserType;
  status?: UserStatus;
  name?: string; // min 3 chars
  phoneNumber?: string; // min 3 chars
  emailAddress?: string; // min 3 chars
}
