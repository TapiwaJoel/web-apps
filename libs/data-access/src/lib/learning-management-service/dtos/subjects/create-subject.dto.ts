import { ContentStatus, SubjectType } from '../../enums';

export interface CreateSubjectDto {
  name: string;
  code: string;
  image: string;
  description?: string;
  educationalLevelId: string;
  examinationBoardId: string;
  subjectType: SubjectType;
  status?: ContentStatus;
}
