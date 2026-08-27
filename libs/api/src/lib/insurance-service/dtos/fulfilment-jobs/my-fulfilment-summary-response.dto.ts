import { FulfilmentJobResponseDto } from './fulfilment-job-response.dto';

export interface MyFulfilmentSummaryResponseDto {
  completedToday: number; // since midnight today
  completedLastThirtyDays: number;
  failedLastThirtyDays: number;
  activeJob?: FulfilmentJobResponseDto; // the job the rider is currently carrying
}
