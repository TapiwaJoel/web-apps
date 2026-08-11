/**
 * ArticleStatus enum
 *
 * Article lifecycle states with soft delete support.
 */
export enum ArticleStatus {
  DRAFT = 'Draft',
  PUBLISHED = 'Published',
  ARCHIVED = 'Archived',
  DELETED = 'Deleted',
}
