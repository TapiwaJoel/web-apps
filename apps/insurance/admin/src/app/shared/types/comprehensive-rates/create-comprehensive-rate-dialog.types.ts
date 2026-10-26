export interface CreateComprehensiveRateForm {
  vehicleType: string;
  vehicleUsage: string;
  rate: number;
}

export const EMPTY_FORM: CreateComprehensiveRateForm = {
  vehicleType: '',
  vehicleUsage: '',
  rate: 0,
};
