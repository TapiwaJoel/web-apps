export interface CreateComprehensiveRateDto {
  vehicleType: string; // MongoId
  vehicleUsage: string;
  rate: number; // percentage 0-100, max 4 decimal places
}
