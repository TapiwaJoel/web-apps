/**
 * Question Status Enumeration
 *
 * Defines the lifecycle status of a question.
 * Controls visibility and availability for users.
 */
export enum QuestionStatus {
  /**
   * Question is in draft state and not visible to users.
   */
  DRAFT = 'DRAFT',

  /**
   * Question is published and visible to users.
   */
  PUBLISHED = 'PUBLISHED',

  /**
   * Question is archived and no longer visible to users.
   */
  ARCHIVED = 'ARCHIVED',
}
