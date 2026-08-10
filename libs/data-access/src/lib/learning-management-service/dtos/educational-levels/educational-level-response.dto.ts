import { CountryStatus } from '../../../common';

export interface EducationalLevelResponseDto {
  _id: string;
  examinationBoardId: string;
  name: string;
  description?: string;
  status: CountryStatus;
  createdAt: string;
  updatedAt: string;
}
