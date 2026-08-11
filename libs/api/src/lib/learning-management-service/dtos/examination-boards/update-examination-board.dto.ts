import { CountryStatus } from '../../../common';

export interface UpdateExaminationBoardDto {
  country?: string;
  name?: string;
  description?: string;
  website?: string;
  status?: CountryStatus;
}
