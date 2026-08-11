import { AssessmentStatus } from '../../enums';

export interface GetAssessmentsQueryDto {
  id?: string;
  examinationPaperId?: string;
  subjectId?: string;
  educationalLevel?: string;
  topicId?: string;
  subTopicId?: string;
  topicTags?: string[];
  status?: AssessmentStatus;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}
