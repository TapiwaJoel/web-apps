export interface CreateVehicleUsageForm {
  vehicleType: string;
  usagesText: string;
}

export const EMPTY_FORM: CreateVehicleUsageForm = {
  vehicleType: '',
  usagesText: '',
};
