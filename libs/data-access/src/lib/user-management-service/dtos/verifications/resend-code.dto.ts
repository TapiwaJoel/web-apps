import { VerificationChannels } from '../enums';

export interface ResendCodeDto {
  verificationId?: string;
  identifier?: string;
  type?: string;
  channel?: VerificationChannels;
}
