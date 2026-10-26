import { UserStatus } from '../../enums';
import { PaginationParams } from '../../../common';

export interface GetSystemUsersQueryDto extends PaginationParams {
  _id?: string;
  user?: string;
  name?: string;
  phoneNumber?: string;
  emailAddress?: string;
  country?: string;
  status?: UserStatus;
  role?: string;
  dateFrom?: string;
  dateTo?: string;
  serviceName?: string;
}
