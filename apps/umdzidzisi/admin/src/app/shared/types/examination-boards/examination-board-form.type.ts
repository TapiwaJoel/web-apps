import { CountryStatus } from '@mushaviri/api';

export interface ExaminationBoardForm {
  name: string;
  country: string;
  description: string;
  website: string;
  status: CountryStatus;
}
