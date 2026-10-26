import { EntityStatus } from '../../../common';
import { ProfileType } from '../../enums';

export interface GetProfilesQueryDto {
  _id?: string;
  systemUser?: string;
  type?: ProfileType;
  status?: EntityStatus;
  educationalLevel?: string;
  grade?: string;
  dateFrom?: string;
  dateTo?: string;
}
