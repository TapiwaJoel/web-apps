import { QuestionType, QuestionPurpose, QuestionStatus } from '../../enums';
import { QuestionAnswersDto } from './question-answers.dto';

/**
 * QuestionResponseDto
 *
 * Data transfer object for service-agnostic question responses.
 * Answer options contain embedded correctness flags (no separate correctAnswers array).
 */
export interface QuestionResponseDto {
  id: string;
  articleId: string;
  authorId: string;
  questionType: QuestionType;
  questionPurpose: QuestionPurpose;
  answers: QuestionAnswersDto;
  hint?: string;
  tags: string[];
  status: QuestionStatus;
  createdAt: string;
  updatedAt: string;
}
