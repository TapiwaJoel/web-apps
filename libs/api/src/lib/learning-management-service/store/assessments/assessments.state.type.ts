import { AssessmentResponseDto } from '../../dtos';

export interface AssessmentsState {
  assessments: AssessmentResponseDto[];
  assessmentsLoaded: boolean;
  assessmentsLoading: boolean;
  assessmentsError: string | null;
}
