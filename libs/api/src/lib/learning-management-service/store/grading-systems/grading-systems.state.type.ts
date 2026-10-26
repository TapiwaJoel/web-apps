import { GradingSystemResponseDto } from '../../dtos';

export interface GradingSystemsState {
  gradingSystems: GradingSystemResponseDto[];
  gradingSystemsLoaded: boolean;
  gradingSystemsLoading: boolean;
  gradingSystemsError: string | null;
}
