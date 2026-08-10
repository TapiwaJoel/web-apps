import { UserType, UserStatus } from '../enums';

export interface CreateUserDto {
  _id?: string;
  name: string;
  phoneNumber: string; // Zimbabwe format: +263 followed by 9 digits
  emailAddress?: string;
  userType: UserType;
  status?: UserStatus;
  country: string;
  password: string; // min length 8
  role: string; // MongoId
}
