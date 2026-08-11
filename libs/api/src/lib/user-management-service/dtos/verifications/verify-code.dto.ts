export interface VerifyCodeDto {
  verificationId: string;
  code: string;
  fcmId?: string;
  newPassword?: string;
}
