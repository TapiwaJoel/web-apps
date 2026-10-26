import { FreeTextConfigDto } from './free-text-config.dto';

/**
 * Free Text Answers DTO
 *
 * Used for FREE_TEXT question type.
 * No predefined answers - open-ended text response.
 */
export interface FreeTextAnswersDto {
  answerType: 'FREE_TEXT';
  config?: FreeTextConfigDto;
}
