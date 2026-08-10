import { QuestionType, QuestionPurpose, QuestionStatus } from '../enums';
import { QuestionAnswersDto } from './question-answers.dto';

/**
 * UpdateQuestionDto
 *
 * Data transfer object for updating an existing question.
 * All fields are optional to support partial updates.
 */
export interface UpdateQuestionDto {
  questionType?: QuestionType;
  questionPurpose?: QuestionPurpose;
  answers?: QuestionAnswersDto;
  hint?: string;
  tags?: string[];
  status?: QuestionStatus;
}
