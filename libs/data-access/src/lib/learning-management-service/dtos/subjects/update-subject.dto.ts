import { ContentStatus, SubjectType } from '../enums';

export interface UpdateSubjectDto {
  name?: string;
  code?: string;
  image?: string;
  description?: string;
  educationalLevelId?: string;
  examinationBoardId?: string;
  subjectType?: SubjectType;
  status?: ContentStatus;
}
