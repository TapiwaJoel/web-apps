import { CountryStatus, PaginationParams } from '../../../common';

export interface GetExaminationBoardsQueryDto extends PaginationParams {
  _id?: string;
  name?: string;
  country?: string;
  status?: CountryStatus;
}
