import { QuestionResponseDto } from '../../dtos';

export interface QuestionsState {
  questions: QuestionResponseDto[];
  questionsLoaded: boolean;
  questionsLoading: boolean;
  questionsError: string | null;
}
