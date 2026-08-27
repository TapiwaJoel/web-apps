import { FulfilmentJobStatus, FulfilmentType } from '../../enums';
import { FulfilmentJobEventResponseDto } from './fulfilment-job-event-response.dto';

export interface FulfilmentJobResponseDto {
  _id: string;
  policyPurchaseId: string;
  fulfilmentType: FulfilmentType;
  status: FulfilmentJobStatus;
  kioskId?: string; // absent until a kiosk is chosen
  riderId?: string; // never set for a Pickup
  deliveryAttempts: number;
  etaSeconds?: number; // remaining on the current leg
  remainingDistanceMetres?: number; // remaining on the current leg
  positionUpdatedAt?: string; // ISO 8601 date-time
  completedAt?: string; // ISO 8601 date-time
  events?: FulfilmentJobEventResponseDto[]; // populated on the single-job endpoint only
  createdAt: string; // ISO 8601 date-time
  updatedAt: string; // ISO 8601 date-time
}
