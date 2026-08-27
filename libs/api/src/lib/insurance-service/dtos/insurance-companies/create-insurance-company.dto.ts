export interface CreateInsuranceCompanyDto {
  systemUserId: string;
  commissionRate: number; // percentage 0-100, max 2 decimals; with marketingRate must not exceed 100
  marketingRate: number; // percentage 0-100, max 2 decimals; with commissionRate must not exceed 100
}
