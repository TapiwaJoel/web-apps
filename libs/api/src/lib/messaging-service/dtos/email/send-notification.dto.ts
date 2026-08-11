import { NotificationType } from '../../enums';

export interface SendNotificationDto {
  to: string;
  notificationType: NotificationType;
  context: Record<string, unknown>;
}
