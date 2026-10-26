import { ContentStatus, SubjectType } from '../../enums';

export interface GetSubjectsQueryDto {
  _id?: string;
  name?: string;
  code?: string;
  educationalLevelId?: string;
  examinationBoardId?: string;
  subjectType?: SubjectType;
  status?: ContentStatus;
}
