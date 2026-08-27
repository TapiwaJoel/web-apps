export interface AssignFulfilmentJobDto {
  riderId?: string; // names a rider directly, overriding the search
  searchRadiusMetres?: number; // positive integer, max 100000
}
