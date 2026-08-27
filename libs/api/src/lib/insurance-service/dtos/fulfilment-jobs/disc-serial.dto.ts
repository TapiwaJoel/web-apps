import { PolicyComponent } from '../../enums';

export interface DiscSerialDto {
  component: PolicyComponent; // only Zinara and Radio produce discs
  serial: string; // max 64 chars
}
