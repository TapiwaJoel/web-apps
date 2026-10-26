import { AssessmentResponseDto } from '@mushaviri/api';
import { StatusTone } from '@mushaviri/ui';

export interface AssessmentRow extends AssessmentResponseDto {
  statusTone: StatusTone;
  paperName: string;
  subjectName: string;
  topicName: string;
  questionCount: number;
  totalMarks: number;
}
