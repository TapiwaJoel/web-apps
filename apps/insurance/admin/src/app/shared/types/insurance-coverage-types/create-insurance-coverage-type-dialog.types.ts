export interface CreateInsuranceCoverageTypeForm {
  insuranceCompany: string;
  name: string;
  description: string;
}

export const EMPTY_FORM: CreateInsuranceCoverageTypeForm = {
  insuranceCompany: '',
  name: '',
  description: '',
};
