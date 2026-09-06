import { VerificationChannels } from '../../enums';

export interface AccountRecoveryResponseDto {
  success: boolean;
  verificationId: string;
  channel: VerificationChannels;
  expiresAt: string;
  expiresInMinutes: number;
}
