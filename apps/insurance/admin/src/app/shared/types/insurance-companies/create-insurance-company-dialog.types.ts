export interface CreateInsuranceCompanyForm {
  systemUserId: string;
  commissionRate: number;
  marketingRate: number;
}

export const EMPTY_FORM: CreateInsuranceCompanyForm = {
  systemUserId: '',
  commissionRate: 0,
  marketingRate: 0,
};
