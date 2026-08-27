import { EntityStatus } from '../../../common';
import { PolicyComponent } from '../../enums';
import { KioskOperatingHoursDto } from './kiosk-operating-hours.dto';

export interface PartnerKioskResponseDto {
  region: string;
  _id: string;
  partnerId: string;
  name: string;
  addressLine: string;
  latitude: number; // decimal degrees, -90 to 90
  longitude: number; // decimal degrees, -180 to 180
  capabilities: PolicyComponent[];
  operatingHours: KioskOperatingHoursDto[];
  isPrintingEnabled: boolean;
  contactPhone: string;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}
