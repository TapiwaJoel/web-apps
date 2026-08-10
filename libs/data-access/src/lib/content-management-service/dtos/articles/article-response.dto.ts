import { AttachedMediaItemDto } from './attached-media-item.dto';
import { ArticleContentBlockDto } from './article-content-block.dto';

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
