/**
 * Resource Type Enum
 *
 * Defines the types of resources tracked in the content-management-service.
 * Used for progress tracking and content type discrimination.
 *
 * Note: This is distinct from learning-management-service's ContentType enum.
 */
export enum ResourceType {
  ARTICLE = 'ARTICLE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  DOCUMENT = 'DOCUMENT',
  IMAGE = 'IMAGE',
}
