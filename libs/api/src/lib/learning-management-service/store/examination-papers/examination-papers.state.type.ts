import { ExaminationPaperResponseDto } from '../../dtos';

export interface ExaminationPapersState {
  examinationPapers: ExaminationPaperResponseDto[];
  examinationPapersLoaded: boolean;
  examinationPapersLoading: boolean;
  examinationPapersError: string | null;
}
