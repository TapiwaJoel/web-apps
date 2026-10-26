import { AssessmentStatus } from '@mushaviri/api';

/** Form model shared by the create dialog and the detail drawer. */
export interface AssessmentForm {
  examinationPaperId: string;
  /** Free text in the backend; prefilled from the paper's subject's level. */
  educationalLevel: string;
  title: string;
  description: string;
  topicId: string;
  subTopicId: string;
  topicTags: string[];
  status: AssessmentStatus;
}
