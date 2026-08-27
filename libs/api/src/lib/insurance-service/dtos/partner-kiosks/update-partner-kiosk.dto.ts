import { EntityStatus } from '../../../common';
import { PolicyComponent } from '../../enums';
import { KioskOperatingHoursDto } from './kiosk-operating-hours.dto';

export interface UpdatePartnerKioskDto {
  region?: string;
  name?: string;
  addressLine?: string;
  latitude?: number; // decimal degrees, send together with longitude
  longitude?: number; // decimal degrees, send together with latitude
  capabilities?: PolicyComponent[]; // non-empty, unique
  operatingHours?: KioskOperatingHoursDto[]; // non-empty
  isPrintingEnabled?: boolean;
  contactPhone?: string;
  status?: EntityStatus;
}
