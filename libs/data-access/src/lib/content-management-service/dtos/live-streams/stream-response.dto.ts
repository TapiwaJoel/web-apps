import { StreamStatus } from '../../enums';
import { StreamAnalyticsDto } from './stream-analytics.dto';

export interface StreamResponseDto {
  _id: string;
  title: string;
  description: string;
  status: StreamStatus;
  streamStartedAt: string | null;
  streamKey: string;
  hostUserId: string;
  speakerIds: string[];
  endedAt: string | null;
  analytics: StreamAnalyticsDto;
  createdAt: string;
  updatedAt: string;
}
