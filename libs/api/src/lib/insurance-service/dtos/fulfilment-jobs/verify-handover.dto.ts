export interface VerifyHandoverDto {
  code: string; // exactly 6 digits
  latitude?: number;
  longitude?: number;
}
