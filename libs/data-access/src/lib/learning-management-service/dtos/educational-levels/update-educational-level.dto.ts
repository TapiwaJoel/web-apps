import { CountryStatus } from '../../../common';

export interface UpdateEducationalLevelDto {
  examinationBoardId?: string;
  name?: string;
  description?: string;
  status?: CountryStatus;
}
