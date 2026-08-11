import { AnswerOptionDto } from './answer-option.dto';

/**
 * Standard Answers DTO
 *
 * Used for question types with a list of answer options:
 * - MULTIPLE_CHOICE (exactly 1 correct)
 * - MULTIPLE_RESPONSE (2+ correct)
 * - TRUE_FALSE (exactly 2 options, 1 correct)
 * - FILL_BLANK (exactly 1 correct from 3-15 options)
 */
export interface StandardAnswersDto {
  answerType: 'STANDARD';
  options: AnswerOptionDto[];
}
