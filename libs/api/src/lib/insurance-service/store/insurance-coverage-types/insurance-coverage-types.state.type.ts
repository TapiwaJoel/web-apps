import { InsuranceCoverageTypeResponseDto } from '../../dtos';

export interface InsuranceCoverageTypesState {
  insuranceCoverageTypes: InsuranceCoverageTypeResponseDto[];
  insuranceCoverageTypesLoaded: boolean;
  insuranceCoverageTypesLoading: boolean;
  insuranceCoverageTypesError: string | null;
}
