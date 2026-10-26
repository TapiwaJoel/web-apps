import { AccessLevel, ContentStatus } from '../../enums';

export interface GetSubTopicsQueryDto {
  _id?: string;
  topicId?: string;
  name?: string;
  status?: ContentStatus;
  accessLevel?: AccessLevel;
  articleId?: string;
}
