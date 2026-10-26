import { VehicleTypeResponseDto } from '@mushaviri/api';
import { StatusTone } from './status-tone.type';

export interface VehicleTypeRow extends VehicleTypeResponseDto {
  statusTone: StatusTone;
}
