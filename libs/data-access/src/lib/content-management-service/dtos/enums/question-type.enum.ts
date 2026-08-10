/**
 * Question Type Enumeration
 *
 * Service-agnostic question types that can be used across any service
 * (learning management, surveys, HR assessments, etc.)
 */
export enum QuestionType {
  /**
   * Multiple choice question with a single correct answer.
   */
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',

  /**
   * Multiple choice question with multiple correct answers.
   */
  MULTIPLE_RESPONSE = 'MULTIPLE_RESPONSE',

  /**
   * True or False question with exactly two options.
   */
  TRUE_FALSE = 'TRUE_FALSE',

  /**
   * Matching question where items from two lists are paired.
   */
  MATCHING = 'MATCHING',

  /**
   * Fill in the blank question (Duolingo-style word selection).
   */
  FILL_BLANK = 'FILL_BLANK',

  /**
   * Free text question requiring open-ended text input.
   */
  FREE_TEXT = 'FREE_TEXT',
}
