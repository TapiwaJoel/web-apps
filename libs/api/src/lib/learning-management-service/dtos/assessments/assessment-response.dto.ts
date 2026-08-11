import { AssessmentStatus } from '../../enums';
import { CreateAssessmentQuestionDto } from './create-assessment-question.dto';

export interface AssessmentResponseDto {
  _id: string;
  examinationPaperId: string;
  subjectId: string;
  educationalLevel: string;
  topicId?: string;
  subTopicId?: string;
  topicTags?: string[];
  title: string;
  description?: string;
  questions: CreateAssessmentQuestionDto[];
  status: AssessmentStatus;
  createdAt: string;
  updatedAt: string;
}
