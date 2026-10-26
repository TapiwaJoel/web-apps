import { ExaminationBoardResponseDto } from '../../dtos';

export interface ExaminationBoardsState {
  examinationBoards: ExaminationBoardResponseDto[];
  examinationBoardsLoaded: boolean;
  examinationBoardsLoading: boolean;
  examinationBoardsError: string | null;
}
