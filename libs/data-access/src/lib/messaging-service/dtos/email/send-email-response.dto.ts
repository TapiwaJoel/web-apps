export interface SendEmailResponseDto {
  success: boolean;
  message: string;
  jobId?: string | number;
  queuedAt?: string;
}
