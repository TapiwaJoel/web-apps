import { VehicleUsageResponseDto } from '../../dtos';

export interface VehicleUsagesState {
  vehicleUsages: VehicleUsageResponseDto[];
  vehicleUsagesLoaded: boolean;
  vehicleUsagesLoading: boolean;
  vehicleUsagesError: string | null;
}
