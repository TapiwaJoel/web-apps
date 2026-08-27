export interface CreateVehicleUsageDto {
  vehicleType: string; // MongoId
  usages: string[]; // at least one entry
}
