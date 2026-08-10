import { SpeakerStatsDto } from './speaker-stats.dto';

export interface StreamAnalyticsDto {
  totalViewers: number;
  peakViewers: number;
  currentViewers: number;
  averageWatchDuration: number;
  totalWatchTime: number;
  speakerStats: SpeakerStatsDto[];
}
