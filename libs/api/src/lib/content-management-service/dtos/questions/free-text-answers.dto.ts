/**
 * Free Text Config DTO
 *
 * Optional configuration for free text questions
 */
export interface FreeTextConfigDto {
  maxLength?: number;
  minLength?: number;
}

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
