export interface GetRiderPositionsQueryDto {
  riderId?: string;
  jobId?: string;
  from?: string; // ISO instant, filters on recordedAt
  to?: string; // ISO instant, filters on recordedAt
}
