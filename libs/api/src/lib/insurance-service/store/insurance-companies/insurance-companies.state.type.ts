import { InsuranceCompanyResponseDto } from '../../dtos';

export interface InsuranceCompaniesState {
  insuranceCompanies: InsuranceCompanyResponseDto[];
  insuranceCompaniesLoaded: boolean;
  insuranceCompaniesLoading: boolean;
  insuranceCompaniesError: string | null;
}
