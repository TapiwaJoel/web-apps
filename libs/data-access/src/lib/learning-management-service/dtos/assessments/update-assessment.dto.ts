import { AssessmentStatus } from '../../enums';
import { UpdateAssessmentQuestionDto } from './update-assessment-question.dto';

export interface UpdateAssessmentDto {
  examinationPaperId?: string;
  educationalLevel?: string;
  topicId?: string;
  subTopicId?: string;
  topicTags?: string[];
  title?: string;
  description?: string;
  questions?: UpdateAssessmentQuestionDto[];
  status?: AssessmentStatus;
}
