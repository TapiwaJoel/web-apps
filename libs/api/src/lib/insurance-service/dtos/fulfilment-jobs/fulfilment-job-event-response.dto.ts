import { FulfilmentActorType, FulfilmentJobStatus } from '../../enums';

export interface FulfilmentJobEventResponseDto {
  from?: FulfilmentJobStatus; // absent for the first event, which had no prior status
  to: FulfilmentJobStatus;
  at: string; // ISO 8601 date-time
  actorType: FulfilmentActorType;
  reason?: string; // set for failures and cancellations
}
