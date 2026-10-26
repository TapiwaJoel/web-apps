import { SubjectResponseDto } from '../../dtos';

export interface SubjectsState {
  subjects: SubjectResponseDto[];
  subjectsLoaded: boolean;
  subjectsLoading: boolean;
  subjectsError: string | null;
}
