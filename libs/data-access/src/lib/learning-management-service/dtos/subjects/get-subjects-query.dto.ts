import { ContentStatus, SubjectType } from '../enums';
import { PaginationParams } from '../../../common';

export interface GetSubjectsQueryDto extends PaginationParams {
  _id?: string;
  name?: string;
  code?: string;
  educationalLevelId?: string;
  examinationBoardId?: string;
  subjectType?: SubjectType;
  status?: ContentStatus;
}
