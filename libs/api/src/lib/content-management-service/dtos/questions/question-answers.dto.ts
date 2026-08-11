import { StandardAnswersDto } from './standard-answers.dto';
import { MatchingAnswersDto } from './matching-answers.dto';
import { FreeTextAnswersDto } from './free-text-answers.dto';

/**
 * Question Answers DTO - Discriminated Union
 *
 * Represents all possible answer structures for questions.
 * TypeScript enforces type safety based on the answerType discriminator.
 */
export type QuestionAnswersDto =
  StandardAnswersDto | MatchingAnswersDto | FreeTextAnswersDto;
