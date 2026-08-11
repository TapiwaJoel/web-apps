export interface SendSmsResponseDto {
  success: boolean;
  message: string;
  jobId?: string | number;
  queuedAt: string;
  recipient: string;
}
