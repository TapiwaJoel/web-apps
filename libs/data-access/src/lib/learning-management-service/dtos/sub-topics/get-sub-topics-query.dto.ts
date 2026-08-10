import { AccessLevel, ContentStatus } from '../enums';
import { PaginationParams } from '../../../common';

export interface GetSubTopicsQueryDto extends PaginationParams {
  _id?: string;
  topicId?: string;
  name?: string;
  status?: ContentStatus;
  accessLevel?: AccessLevel;
  articleId?: string;
}
