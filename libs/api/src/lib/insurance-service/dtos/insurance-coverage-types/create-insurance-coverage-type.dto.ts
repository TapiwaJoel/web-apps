export interface CreateInsuranceCoverageTypeDto {
  insuranceCompany: string;
  name: string; // unique per insuranceCompany, not globally
  description?: string;
}
