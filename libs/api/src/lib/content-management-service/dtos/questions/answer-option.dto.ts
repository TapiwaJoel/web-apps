/**
 * AnswerOptionDto
 *
 * Data transfer object for an answer option with embedded correctness and explanation.
 * Each option is self-contained with all necessary information for validation and feedback.
 */
export interface AnswerOptionDto {
  id: string;
  content: string;
  order: number;
  isCorrect?: boolean;
  explanation?: string;
}
