import { EntityStatus } from '../../../common';

export interface GetInsuranceCoverageTypesQueryDto {
  _id?: string;
  insuranceCompany?: string;
  name?: string;
  status?: EntityStatus;
}
