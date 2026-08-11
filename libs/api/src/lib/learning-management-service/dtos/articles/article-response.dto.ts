/**
 * Mirrors backend ArticleContentBlockDto (content-management-service).
 * `type` is kept as `string` here (backend uses ArticleContentBlockType enum,
 * not mirrored in this library since only the article response references it).
 */
export interface ArticleContentBlockDto {
  type: string;
  content: string;
  order: number;
  metadata?: Record<string, unknown>;
}

/** Mirrors backend AttachedMediaItemDto (content-management-service). */
export interface AttachedMediaItemDto {
  resourceId: string;
  caption?: string;
  displayOrder: number;
}

/**
 * Mirrors backend ArticleResponseDto (content-management-service), returned
 * by the learning-management-service sub-topics `getArticles` endpoint.
 */
export interface ArticleResponseDto {
  id: string;
  title: string;
  subtitle?: string;
  content: ArticleContentBlockDto[];
  attachedMedia: AttachedMediaItemDto[];
  featuredImage?: string;
  status: 'Draft' | 'Published' | 'Archived' | 'Deleted';
  version: number;
  publishedVersion: number | null;
  publishedAt: string | null;
  scheduledPublishAt?: string;
  lastModifiedAt: string;
  authorId: string;
  lastModifiedBy: string;
  viewCount: number;
  readingTimeMinutes: number;
  commentsEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}
