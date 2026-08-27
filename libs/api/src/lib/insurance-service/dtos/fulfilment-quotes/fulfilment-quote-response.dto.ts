import { Currency } from '../../../common';
import { FulfilmentType } from '../../enums';

export interface FulfilmentQuoteResponseDto {
  _id: string; // cite this on the resulting purchase
  fulfilmentType: FulfilmentType;
  kioskId: string | null; // null when no capable kiosk was open at quoting time
  feeAmount: number; // computed server-side; always 0 for a Pickup
  currency: Currency;
  distanceMetres: number;
  estimatedDurationSeconds: number | null; // 0 for a Pickup, null when no kiosk is known
  awaitingKioskAvailability: boolean; // not an error; the job waits until a kiosk opens
  expiresAt: string; // ISO 8601 date-time; an expired quote is still readable
  createdAt: string; // ISO 8601 date-time
}
