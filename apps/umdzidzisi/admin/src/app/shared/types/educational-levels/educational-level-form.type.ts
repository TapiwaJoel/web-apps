import { CountryStatus } from '@mushaviri/api';

export interface EducationalLevelForm {
  examinationBoardId: string;
  name: string;
  description: string;
  status: CountryStatus;
}
