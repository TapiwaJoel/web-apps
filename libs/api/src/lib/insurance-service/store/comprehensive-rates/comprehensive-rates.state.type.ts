import { ComprehensiveRateResponseDto } from '../../dtos';

export interface ComprehensiveRatesState {
  comprehensiveRates: ComprehensiveRateResponseDto[];
  comprehensiveRatesLoaded: boolean;
  comprehensiveRatesLoading: boolean;
  comprehensiveRatesError: string | null;
}
