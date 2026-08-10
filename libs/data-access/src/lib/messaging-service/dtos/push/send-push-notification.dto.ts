import { NotificationPlatform } from '../enums';

export interface SendPushNotificationDto {
  deviceToken?: string;
  deviceTokens?: string[];
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
  platform?: NotificationPlatform;
  webClickAction?: string;
  androidClickAction?: string;
}
