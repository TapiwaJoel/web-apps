import { CompletionStatus, ResourceType } from '../../enums';

export interface BookmarkDto {
  position: number;
  label: string;
  createdAt: string;
}

export interface ContentProgressResponseDto {
  _id: string;
  contentId: string;
  systemUserId: string;
  contentType: ResourceType;
  completionStatus: CompletionStatus;
  progressPercentage: number;
  timeSpentMinutes: number;
  lastPlaybackPosition?: number;
  lastReadPosition?: number;
  lastPageViewed?: number;
  totalDuration?: number;
  totalPages?: number;
  estimatedReadingTime?: number;
  bookmarks?: BookmarkDto[];
  watchCount?: number;
  completionThreshold?: number;
  lastAccessedAt: string;
  completedAt?: string;
  notes?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}
