export interface GetStuckFulfilmentJobsQueryDto {
  thresholdMinutes?: number; // minutes without movement; 1-10080, defaults to 30
}
