/**
 * Enum defining the purpose of a question.
 *
 * @enum {string}
 */
export enum QuestionPurpose {
  /**
   * Assessment questions have correct/incorrect answers and are used for testing knowledge.
   * Requires isCorrect, hint, and explanation for all answer options.
   */
  ASSESSMENT = 'ASSESSMENT',

  /**
   * Poll questions gather opinions/feedback with no correct answers.
   * Does not require isCorrect, hint, or explanation for answer options.
   */
  POLL = 'POLL',
}
