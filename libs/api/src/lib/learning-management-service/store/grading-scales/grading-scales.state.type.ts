import { GradingScaleResponseDto } from '../../dtos';

export interface GradingScalesState {
  gradingScales: GradingScaleResponseDto[];
  gradingScalesLoaded: boolean;
  gradingScalesLoading: boolean;
  gradingScalesError: string | null;
}
