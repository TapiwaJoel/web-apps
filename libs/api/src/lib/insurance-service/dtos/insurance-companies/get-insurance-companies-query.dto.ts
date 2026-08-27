import { EntityStatus } from '../../../common';

export interface GetInsuranceCompaniesQueryDto {
  _id?: string;
  systemUserId?: string;
  status?: EntityStatus;
}
