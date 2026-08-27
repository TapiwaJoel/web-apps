import { FulfilmentJobStatus } from '../../enums';

// No riderId: the rider is resolved from the authenticated principal and
// sending one is rejected with 400.
export interface GetMyFulfilmentJobsQueryDto {
  status?: FulfilmentJobStatus;
}
