import { CountryStatus } from '../../../common';

export interface GetExaminationBoardsQueryDto {
  _id?: string;
  name?: string;
  country?: string;
  status?: CountryStatus;
}
