export interface DeviceResponseDto {
  _id?: string;
  systemUser: string;
  deviceId: string;
  fcmId?: string;
  deviceType: string;
  name: string;
  platform: string;
  platformVersion: string;
  browser?: string;
  browserVersion?: string;
  deviceModel?: string;
  isActive: boolean;
  lastUsedAt: string;
  createdAt: string;
  updatedAt: string;
}
