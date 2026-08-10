export interface PushNotificationQueueResponseDto {
  success: boolean;
  message: string;
  jobId?: string | number;
  queuedAt: string;
  deviceTokens?: string[];
}
