import { CountryStatus, PaginationParams } from '../../../common';

export interface GetEducationalLevelsQueryDto extends PaginationParams {
  _id?: string;
  name?: string;
  examinationBoardId?: string;
  status?: CountryStatus;
}
