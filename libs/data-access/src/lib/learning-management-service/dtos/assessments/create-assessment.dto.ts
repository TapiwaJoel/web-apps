import { AssessmentStatus } from '../../enums';
import { CreateAssessmentQuestionDto } from './create-assessment-question.dto';

export interface CreateAssessmentDto {
  examinationPaperId: string;
  educationalLevel: string;
  topicId?: string;
  subTopicId?: string;
  topicTags?: string[];
  title: string;
  description?: string;
  questions?: CreateAssessmentQuestionDto[];
  status?: AssessmentStatus;
}
