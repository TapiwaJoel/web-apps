import { AttachedMediaItemDto } from './attached-media-item.dto';
import { ArticleContentBlockDto } from './article-content-block.dto';

export interface CreateArticleDto {
  title: string;
  subtitle?: string;
  featuredImageId?: string;
  contentBlocks: ArticleContentBlockDto[];
  attachedMedia?: AttachedMediaItemDto[];
  readingTimeMinutes?: number;
}
