export interface CreateVehicleTypeForm {
  name: string;
  description: string;
}

export const EMPTY_FORM: CreateVehicleTypeForm = {
  name: '',
  description: '',
};
