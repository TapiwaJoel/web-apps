import { DeviceResponseDto } from '../../dtos';

export interface DevicesState {
  devices: Partial<DeviceResponseDto>[];
  devicesLoaded: boolean;
  devicesLoading: boolean;
  devicesError: string | null;
}
