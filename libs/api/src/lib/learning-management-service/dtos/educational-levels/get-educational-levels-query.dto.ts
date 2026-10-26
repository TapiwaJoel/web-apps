import { CountryStatus } from '../../../common';

export interface GetEducationalLevelsQueryDto {
  _id?: string;
  name?: string;
  examinationBoardId?: string;
  status?: CountryStatus;
}
