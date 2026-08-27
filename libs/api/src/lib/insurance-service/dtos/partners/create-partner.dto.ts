export interface CreatePartnerDto {
  systemUserId: string;
  commissionRate: number; // percentage, 0-100, max 2 decimal places
}
