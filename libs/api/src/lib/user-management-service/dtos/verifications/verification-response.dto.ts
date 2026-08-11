import { VerificationChannels } from '../../enums';

export interface VerificationResponseDto {
  verificationType?: string;
  channel?: VerificationChannels;
  verified: boolean;
  verifiedAt: string;
  createdAt: string;
  updatedAt: string;
}
