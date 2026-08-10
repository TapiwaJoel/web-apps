import { ResourceType } from '../../enums';

export interface CreateContentProgressDto {
  contentId: string;
  contentType: ResourceType;
  initialPosition?: number;
  notes?: string;
  systemUserId?: string;
}
