import { ExaminationResponseDto } from '../../dtos';

export interface ExaminationsState {
  examinations: ExaminationResponseDto[];
  examinationsLoaded: boolean;
  examinationsLoading: boolean;
  examinationsError: string | null;
}
