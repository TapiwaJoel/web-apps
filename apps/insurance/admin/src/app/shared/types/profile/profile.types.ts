import { DeviceResponseDto } from '@mushaviri/api';

const DEVICE_TYPE_ICONS: Record<string, string> = {
  desktop: 'fi fi-rr-laptop',
  mobile: 'fi fi-rr-smartphone',
  tablet: 'fi fi-rr-tablet',
};
const DEFAULT_DEVICE_TYPE_ICON: string = 'fi fi-rr-computer';

export function deviceTypeIconFor(deviceType: string | undefined): string {
  if (!deviceType) {
    return DEFAULT_DEVICE_TYPE_ICON;
  }
  return (
    DEVICE_TYPE_ICONS[deviceType.toLowerCase()] ?? DEFAULT_DEVICE_TYPE_ICON
  );
}

export interface DeviceRow extends Partial<DeviceResponseDto> {
  icon: string;
}
