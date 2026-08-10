import { EntityStatus, PaginationParams } from '../../../common';
import { ProfileType } from '../enums';

export interface GetProfilesQueryDto extends PaginationParams {
  _id?: string;
  systemUser?: string;
  type?: ProfileType;
  status?: EntityStatus;
  educationalLevel?: string;
  grade?: string;
  dateFrom?: string;
  dateTo?: string;
}
