import { VehicleUsageResponseDto } from '@mushaviri/api';
import { StatusTone } from './status-tone.type';

export interface VehicleUsageRow extends VehicleUsageResponseDto {
  statusTone: StatusTone;
  vehicleTypeName: string;
}
