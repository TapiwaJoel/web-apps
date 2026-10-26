import { DeviceResponseDto } from '@mushaviri/api';

export interface DeviceRow extends Partial<DeviceResponseDto> {
  icon: string;
}
