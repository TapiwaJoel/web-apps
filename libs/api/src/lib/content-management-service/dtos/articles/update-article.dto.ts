import { AttachedMediaItemDto } from './attached-media-item.dto';
import { ArticleContentBlockDto } from './article-content-block.dto';
import { ArticleStatus } from '../../enums';

export interface UpdateArticleDto {
  title?: string;
  subtitle?: string;
  featuredImageId?: string;
  contentBlocks?: ArticleContentBlockDto[];
  attachedMedia?: AttachedMediaItemDto[];
  status?: ArticleStatus;
  scheduledPublishAt?: string;
}
