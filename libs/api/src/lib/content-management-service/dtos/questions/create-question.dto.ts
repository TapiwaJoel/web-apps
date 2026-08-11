import { QuestionType, QuestionPurpose, QuestionStatus } from '../../enums';
import { QuestionAnswersDto } from './question-answers.dto';

/**
 * CreateQuestionDto
 *
 * Data transfer object for creating a new service-agnostic question.
 * Question body comes from the article. Answer options contain embedded correctness flags.
 */
export interface CreateQuestionDto {
  articleId: string;
  questionType: QuestionType;
  questionPurpose?: QuestionPurpose;
  answers: QuestionAnswersDto;
  hint?: string;
  tags?: string[];
  status?: QuestionStatus;
}
