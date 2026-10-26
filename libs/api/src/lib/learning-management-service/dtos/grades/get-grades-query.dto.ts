import { EntityStatus } from '../../../common';

export interface GetGradesQueryDto {
  _id?: string;
  name?: string;
  educationalLevelId?: string;
  status?: EntityStatus;
}
