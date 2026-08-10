import { NotificationType } from '../enums';

export interface SendSmsDto {
  to: string;
  notificationType: NotificationType;
  context: Record<string, unknown>;
}
