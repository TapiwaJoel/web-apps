import { PaginationParams } from '../../../common';

export interface GetDevicesQueryDto extends PaginationParams {
  _id?: string;
  systemUser?: string;
  deviceType?: string;
  deviceId?: string;
  name?: string;
  platform?: string;
  isActive?: boolean;
}
