import { EntityStatus } from '../../../common';

export interface UpdateInsuranceCoverageTypeDto {
  name?: string; // unique per insuranceCompany, not globally
  description?: string;
  status?: EntityStatus;
}
