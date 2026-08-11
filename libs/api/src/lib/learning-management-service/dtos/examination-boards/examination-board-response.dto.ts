import { CountryStatus } from '../../../common';

export interface ExaminationBoardResponseDto {
  _id: string;
  country: string;
  name: string;
  description?: string;
  website?: string;
  status: CountryStatus;
  date: string;
  createdAt: string;
  updatedAt: string;
}
