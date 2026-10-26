import { VehicleTypeResponseDto } from '../../dtos';

export interface VehicleTypesState {
  vehicleTypes: VehicleTypeResponseDto[];
  vehicleTypesLoaded: boolean;
  vehicleTypesLoading: boolean;
  vehicleTypesError: string | null;
}
