import { CompletionStatus, ResourceType } from '../../enums';

export interface GetContentProgressQueryDto {
  _id?: string;
  contentId?: string;
  profileId?: string;
  completionStatus?: CompletionStatus;
  contentType?: ResourceType;
}
