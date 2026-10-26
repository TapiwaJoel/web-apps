import { EducationalLevelResponseDto } from '../../dtos';

export interface EducationalLevelsState {
  educationalLevels: EducationalLevelResponseDto[];
  educationalLevelsLoaded: boolean;
  educationalLevelsLoading: boolean;
  educationalLevelsError: string | null;
}
