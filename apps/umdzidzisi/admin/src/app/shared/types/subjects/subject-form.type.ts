import { ContentStatus, SubjectType } from '@mushaviri/api';

export interface SubjectForm {
  examinationBoardId: string;
  educationalLevelId: string;
  name: string;
  code: string;
  subjectType: SubjectType;
  description: string;
  image: string;
  status: ContentStatus;
}
