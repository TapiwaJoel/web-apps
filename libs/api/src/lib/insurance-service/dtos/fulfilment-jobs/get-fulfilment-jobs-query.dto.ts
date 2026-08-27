import { FulfilmentJobStatus } from '../../enums';

export interface GetFulfilmentJobsQueryDto {
  status?: FulfilmentJobStatus;
  kioskId?: string;
  riderId?: string;
  createdFrom?: string; // ISO 8601 date-time
  createdTo?: string; // ISO 8601 date-time
}
