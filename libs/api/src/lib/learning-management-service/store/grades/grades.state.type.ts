import { GradeResponseDto } from '../../dtos';

export interface GradesState {
  grades: GradeResponseDto[];
  gradesLoaded: boolean;
  gradesLoading: boolean;
  gradesError: string | null;
}
