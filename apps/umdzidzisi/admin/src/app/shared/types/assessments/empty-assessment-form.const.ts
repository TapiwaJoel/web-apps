import { AssessmentStatus } from '@mushaviri/api';
import { AssessmentForm } from './assessment-form.type';

export const EMPTY_ASSESSMENT_FORM: AssessmentForm = {
  examinationPaperId: '',
  educationalLevel: '',
  title: '',
  description: '',
  topicId: '',
  subTopicId: '',
  topicTags: [],
  status: AssessmentStatus.DRAFT,
};
