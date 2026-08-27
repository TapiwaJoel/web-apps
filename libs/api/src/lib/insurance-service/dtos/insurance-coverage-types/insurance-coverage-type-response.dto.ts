import { EntityStatus } from '../../../common';

export interface InsuranceCoverageTypeResponseDto {
  _id: string;
  insuranceCompany: string;
  name: string;
  description?: string;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}
