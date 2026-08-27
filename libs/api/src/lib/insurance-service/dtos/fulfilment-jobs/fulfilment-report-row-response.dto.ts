export interface FulfilmentReportRowResponseDto {
  groupKey?: string; // the rider or kiosk; absent on the single overall row
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  completionRate: number; // 0 to 100
  averageTotalDurationSeconds?: number; // absent when the group completed no jobs
  averageTimeAtKioskSeconds?: number; // wait attributable to the kiosk
  averageTimeOnRoadSeconds?: number; // time attributable to the road
}
