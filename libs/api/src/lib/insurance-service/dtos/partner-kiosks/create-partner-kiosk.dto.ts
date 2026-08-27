import { PolicyComponent } from '../../enums';
import { KioskOperatingHoursDto } from './kiosk-operating-hours.dto';

export interface CreatePartnerKioskDto {
  region: string;
  partnerId: string;
  name: string;
  addressLine: string;
  latitude: number; // decimal degrees, -90 to 90
  longitude: number; // decimal degrees, -180 to 180
  capabilities: PolicyComponent[]; // non-empty, unique
  operatingHours: KioskOperatingHoursDto[]; // non-empty
  isPrintingEnabled?: boolean; // defaults to true
  contactPhone: string;
}
